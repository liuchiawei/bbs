/**
 * Events Service Layer
 * イベントサービス層
 * Business logic for event management and external API synchronization
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getOrCreateFighterByName } from "./fighters";
import { linkFightToEvent } from "./fighter-events";
import { linkFighterToEvent } from "./fighter-events";
import { parseFightCard } from "@/lib/utils/fight-card-parser";
import type {
  Event,
  UnifiedEventData,
  ExternalEventSource,
  SportType,
} from "@/lib/types";
import { TheSportsDBClient } from "@/lib/adapters/thesportsdb";
import { generateEventId } from "@/lib/utils/id-generator";
import { findMatchingEvent } from "@/lib/utils/event-matcher";
import type { MergeEventOptions } from "@/lib/types";
import { createAuditLog } from "./audit";

/**
 * Create event with multiple fights (Transaction)
 * 創建賽事及所有對戰（Transaction）
 * 
 * @param eventData Event基本資訊
 * @param fights 對戰列表
 * @returns Created event with fights
 * 
 * 使用Transaction確保資料一致性，一次性創建Event和所有FighterEvent記錄
 * Uses Transaction to ensure data consistency, creates Event and all FighterEvent records in one operation
 */
export async function createEventWithFights(
  eventData: {
    name: string;
    fight_date: Date;
    sport_type?: string;
    promoter?: string;
    organization?: string;
    venue?: string;
    location?: string;
    description?: string;
    poster_url?: string;
    status?: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
    external_id?: string;
    external_source?: string;
    external_data?: Prisma.InputJsonValue;
  },
  fights: Array<{
    fighterId: string;
    opponentId: string;
    fightType: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
    fightOrder: number;
    weightClass?: string;
    isBettable?: boolean;
  }>
) {
  // 生成Event ID
  // Generate Event ID
  const eventId = await generateEventId();

  return await prisma.$transaction(async (tx) => {
    // 創建Event
    // Create Event
    const event = await tx.event.create({
      data: {
        id: eventId,
        name: eventData.name,
        fight_date: eventData.fight_date,
        status: eventData.status || "PENDING",
        sport_type: eventData.sport_type || null,
        promoter: eventData.promoter || null,
        organization: eventData.organization || null,
        venue: eventData.venue || null,
        location: eventData.location || null,
        description: eventData.description || null,
        poster_url: eventData.poster_url || null,
        external_id: eventData.external_id || null,
        external_source: eventData.external_source || null,
        external_data: eventData.external_data || null,
        last_synced_at: eventData.external_id ? new Date() : null,
        sync_status: eventData.external_id ? "completed" : "pending",
      },
    });

    // 批量創建FighterEvent記錄
    // Batch create FighterEvent records
    const fighterEvents = await Promise.all(
      fights.map((fight) =>
        tx.fighterEvent.create({
          data: {
            event_id: event.id,
            fighter_id: fight.fighterId,
            opponent_id: fight.opponentId,
            fight_type: fight.fightType,
            fight_order: fight.fightOrder,
            weight_class: fight.weightClass || null,
            is_bettable: fight.isBettable !== false, // 預設true
            status: "CONFIRMED",
          },
        })
      )
    );

    return {
      event,
      fights: fighterEvents,
    };
  });
}

/**
 * Get event with all fights (完整對戰卡)
 * 獲取賽事及完整對戰卡
 * 
 * @param eventId Event ID
 * @returns Event with fights, fighters, and betting stats
 * 
 * 使用include一次性獲取所有相關資料，避免N+1查詢問題
 * Uses include to fetch all related data in one query, avoiding N+1 query problem
 */
export async function getEventWithFights(eventId: string) {
  return unstable_cache(
    async () => {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          fighterEvents: {
            include: {
              fighter: true,
              opponent: true,
              _count: {
                select: {
                  bets: true,
                },
              },
            },
            orderBy: {
              fight_order: "asc",
            },
          },
          _count: {
            select: {
              bets: true,
              posts: true,
            },
          },
        },
      });

      return event;
    },
    [`event-with-fights-${eventId}`],
    {
      tags: ["events", `event-${eventId}`, `event-fights-${eventId}`],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();
}

/**
 * Get weekly combat events (boxing, UFC, MMA) with fights
 * 今週の格闘技イベントを取得（ボクシング、UFC、MMA），包含對戰列表
 */
export async function getWeeklyCombatEvents(): Promise<Event[]> {
  return unstable_cache(
    async () => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // 週の始まり / Start of week
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7); // 週の終わり / End of week
      endOfWeek.setHours(23, 59, 59, 999);

      const events = await prisma.event.findMany({
        where: {
          fight_date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
          sport_type: {
            in: ["boxing", "ufc", "mma"],
          },
        },
        orderBy: {
          fight_date: "asc",
        },
        include: {
          fighterEvents: {
            include: {
              fighter: true,
              opponent: true,
            },
            orderBy: {
              fight_order: "asc",
            },
          },
          _count: {
            select: {
              bets: true,
              posts: true,
            },
          },
        },
      });

      return events as Event[];
    },
    ["weekly-combat-events"],
    {
      tags: ["events"],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();
}

/**
 * Get all combat events with optional filters
 * すべての格闘技イベントを取得（オプションフィルタ付き）
 * Uses unstable_cache for optimal performance (Next.js 16)
 */
export async function getCombatEvents(
  options: {
    sportType?: SportType | "all";
    status?: Event["status"] | "all";
    limit?: number;
    offset?: number;
    dateRange?: "week" | "month" | "all";
  } = {}
): Promise<Event[]> {
  const {
    sportType = "all",
    status = "all",
    limit = 50,
    offset = 0,
    dateRange = "week",
  } = options;

  // キャッシュキーを生成
  // Generate cache key
  const cacheKey = `combat-events-${sportType}-${status}-${dateRange}-${limit}-${offset}`;

  return unstable_cache(
    async () => {
      const where: any = {};

      // Sport type filter
      if (sportType !== "all") {
        where.sport_type = sportType;
      } else {
        where.sport_type = {
          in: ["boxing", "ufc", "mma"],
        };
      }

      // Status filter
      if (status !== "all") {
        where.status = status;
      }

      // Date range filter
      if (dateRange === "week") {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        where.fight_date = {
          gte: startOfWeek,
          lte: endOfWeek,
        };
      } else if (dateRange === "month") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

        where.fight_date = {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }

      const events = await prisma.event.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          fight_date: "asc",
        },
        include: {
          _count: {
            select: {
              bets: true,
              posts: true,
            },
          },
        },
      });

      return events as Event[];
    },
    [cacheKey],
    {
      tags: ["events"],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();
}

/**
 * Merge external API data with existing manual event
 * 合併外部 API 資料與現有手動賽事
 * Preserves manual fields (fighter IDs, winner, override flags) while updating external data
 * 保留手動欄位（選手 ID、勝者、覆蓋標記），同時更新外部資料
 *
 * @param existingEvent Existing event from database
 * @param unifiedEvent External API event data
 * @param source External API source
 * @param options Merge options (includes adminId for audit logging)
 * @returns Updated event ID
 *
 * Merge rules:
 * - Preserve: fighter_1_id, fighter_2_id, winner_id, is_manual_override, status (if manually set)
 * - Update: external_id, external_source, external_data, last_synced_at
 * - Smart update: name (if external is more complete), sport_type (if empty), fight_date (if external is more precise)
 */
async function mergeEventData(
  existingEvent: Event,
  unifiedEvent: UnifiedEventData,
  source: ExternalEventSource,
  options: MergeEventOptions & { adminId?: string } = {}
): Promise<string> {
  const {
    preserveManualFields = true,
    forceUpdateExternalFields = false,
  } = options;

  // Prepare update data
  // 準備更新資料
  const updateData: Prisma.EventUpdateInput = {
    // Always update external fields (if not preserving or forcing update)
    // 始終更新外部欄位（如果不保留或強制更新）
    external_id: unifiedEvent.external_id,
    external_source: source,
    external_data: unifiedEvent.external_data as Prisma.InputJsonValue,
    last_synced_at: new Date(),
    sync_status: "completed",
  };

  // Smart update: only update if field is empty or external is better
  // 智能更新：僅在欄位為空或外部資料更好時更新
  if (!existingEvent.sport_type && unifiedEvent.sport_type) {
    updateData.sport_type = unifiedEvent.sport_type;
  }

  // Update name if external name is more complete (longer and contains more info)
  // 如果外部名稱更完整（更長且包含更多資訊），則更新名稱
  if (
    unifiedEvent.name.length > existingEvent.name.length &&
    unifiedEvent.name.length > existingEvent.name.length * 1.2
  ) {
    updateData.name = unifiedEvent.name;
  }

  // Update fight_date if external date is more precise (has time component)
  // 如果外部日期更精確（包含時間成分），則更新日期
  const externalDate = new Date(unifiedEvent.fight_date);
  const existingDate = new Date(existingEvent.fight_date);
  if (
    externalDate.getHours() !== 0 ||
    externalDate.getMinutes() !== 0 ||
    (existingDate.getHours() === 0 && existingDate.getMinutes() === 0)
  ) {
    updateData.fight_date = unifiedEvent.fight_date;
  }

  // Preserve manual fields if option is enabled
  // 如果選項啟用，保留手動欄位
  if (preserveManualFields) {
    // Do not overwrite manual fields - they are already set correctly
    // 不覆蓋手動欄位 - 它們已經正確設定
    // fighter_1_id, fighter_2_id, winner_id, is_manual_override are preserved automatically
    // fighter_1_id, fighter_2_id, winner_id, is_manual_override 會自動保留
  }

  // Update event
  // 更新賽事
  await prisma.event.update({
    where: { id: existingEvent.id },
    data: updateData,
  });

  // Log merge operation in audit log (if adminId provided)
  // 在審計日誌中記錄合併操作（如果提供了 adminId）
  if (options.adminId) {
    try {
      await createAuditLog(
        options.adminId,
        "MERGE_EVENT",
        `Merged external event "${unifiedEvent.name}" (${unifiedEvent.external_id}) with manual event "${existingEvent.name}" (${existingEvent.id})`,
        "system"
      );
    } catch (error) {
      // Audit log failure should not interrupt merge operation
      // 審計日誌失敗不應中斷合併操作
      console.error("Failed to create audit log for event merge:", error);
    }
  }

  return existingEvent.id;
}

/**
 * Sync events from external API (TheSportsDB)
 * 外部API（TheSportsDB）からイベントを同期
 */
export async function syncEventsFromExternalAPI(
  source: ExternalEventSource = "thesportsdb",
  adminId?: string
): Promise<{
  created: number;
  updated: number;
  merged: number;
  errors: number;
}> {
  // V1 API: API key はオプション（デフォルトで無料キー "123" を使用）
  // V1 API: API key is optional (uses free key "123" by default)
  const apiKey = process.env.THESPORTSDB_API_KEY || "123";

  const client = new TheSportsDBClient({ apiKey });

  // より広い日付範囲を計算（今日から未来3ヶ月）
  // Calculate wider date range (today to 3 months in the future)
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(now);
  endDate.setMonth(now.getMonth() + 3); // 3ヶ月後 / 3 months later
  endDate.setHours(23, 59, 59, 999);

  let created = 0;
  let updated = 0;
  let merged = 0;
  let errors = 0;

  try {
    console.log(
      `[Sync] Fetching events from ${
        startDate.toISOString().split("T")[0]
      } to ${endDate.toISOString().split("T")[0]}`
    );

    // 日付範囲でイベントを取得
    // Fetch events by date range
    const unifiedEvents = await client.getEventsByDateRange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    console.log(`[Sync] Fetched ${unifiedEvents.length} events from API`);

    if (unifiedEvents.length === 0) {
      console.warn(
        `[Sync] WARNING: No events fetched from API. This could mean:`
      );
      console.warn(`  1. API returned no events`);
      console.warn(`  2. All events were filtered out by date range`);
      console.warn(`  3. All events failed to transform`);
      console.warn(`  Please check server logs for details.`);
    }

    // Batch query: Fetch all candidate events for fuzzy matching (events without external_id in date range)
    // 批量查詢：獲取所有候選賽事用於模糊匹配（日期範圍內沒有 external_id 的賽事）
    const candidateEvents = await prisma.event.findMany({
      where: {
        external_id: null, // Only manual events / 僅手動創建的賽事
        fight_date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    console.log(
      `[Sync] Found ${candidateEvents.length} candidate events for fuzzy matching`
    );

    // Process each unified event
    // 處理每個統一格式的賽事
    for (const unifiedEvent of unifiedEvents) {
      try {
        // Phase 1: Exact match by external_id + external_source
        // 階段 1：通過 external_id + external_source 精確匹配
        const existing = await prisma.event.findFirst({
          where: {
            external_id: unifiedEvent.external_id,
            external_source: source,
          },
        });

        let eventId: string;

        if (existing) {
          // Exact match found - update existing event
          // 找到精確匹配 - 更新現有賽事
          await prisma.event.update({
            where: { id: existing.id },
            data: {
              name: unifiedEvent.name,
              fight_date: unifiedEvent.fight_date,
              status: determineEventStatus(unifiedEvent.fight_date),
              external_data:
                unifiedEvent.external_data as Prisma.InputJsonValue,
              sport_type: unifiedEvent.sport_type,
              last_synced_at: new Date(),
              sync_status: "completed",
            },
          });
          eventId = existing.id;
          updated++;
        } else {
          // Phase 2: Fuzzy matching for manual events
          // 階段 2：對手動創建的賽事進行模糊匹配
          const fuzzyMatch = findMatchingEvent(
            unifiedEvent,
            candidateEvents as Event[],
            0.8 // 80% similarity threshold / 80% 相似度閾值
          );

          if (fuzzyMatch) {
            // Fuzzy match found - merge with existing manual event
            // 找到模糊匹配 - 與現有手動賽事合併
            console.log(
              `[Sync] Fuzzy match found: "${unifiedEvent.name}" matches "${fuzzyMatch.event.name}" (similarity: ${(fuzzyMatch.similarityScore * 100).toFixed(1)}%)`
            );
            eventId = await mergeEventData(
              fuzzyMatch.event,
              unifiedEvent,
              source,
              { preserveManualFields: true, adminId }
            );
            merged++;
          } else {
            // No match found - create new event
            // 未找到匹配 - 創建新賽事
            const id = await generateEventId();

            const newEvent = await prisma.event.create({
              data: {
                id,
                name: unifiedEvent.name,
                fight_date: unifiedEvent.fight_date,
                status: determineEventStatus(unifiedEvent.fight_date),
                external_id: unifiedEvent.external_id,
                external_source: source,
                external_data:
                  unifiedEvent.external_data as Prisma.InputJsonValue,
                sport_type: unifiedEvent.sport_type,
                last_synced_at: new Date(),
                sync_status: "completed",
              },
            });
            eventId = newEvent.id;
            created++;
          }
        }

        // 對戰卡を解析して選手をリンク
        // Parse fight card and link fighters
        try {
          const strResult = unifiedEvent.external_data?.strResult as
            | string
            | undefined;
          if (strResult) {
            const fights = parseFightCard(strResult);

            // 批量處理對戰，第一個為主賽，其餘為預賽
            // Batch process fights, first is main event, rest are prelims
            for (let i = 0; i < fights.length; i++) {
              const fight = fights[i];
              try {
                // 選手を取得または作成
                // Get or create fighters
                const fighter1 = await getOrCreateFighterByName(
                  fight.fighter1,
                  unifiedEvent.sport_type
                );
                const fighter2 = await getOrCreateFighterByName(
                  fight.fighter2,
                  unifiedEvent.sport_type
                );

                if (fighter1 && fighter2) {
                  // 決定對戰類型：第一個為主賽，其餘為預賽
                  // Determine fight type: first is main event, rest are prelims
                  const fightType =
                    i === 0 ? "MAIN" : i === 1 ? "CO_MAIN" : "PRELIMS";

                  // 選手をイベントにリンク（使用新的結構）
                  // Link fighters to event (using new structure)
                  await linkFightToEvent(fighter1.id, fighter2.id, eventId, {
                    fightType,
                    fightOrder: i + 1, // 從1開始
                    weightClass: fight.weightClass || null,
                    method: fight.method || null,
                    round: fight.round ? parseInt(fight.round) : null,
                    time: fight.time || null,
                    isBettable: true, // 預設可投注
                    status: "CONFIRMED",
                    // 結果はまだ不明（未来のイベント）
                    // Result is unknown (future event)
                    fighter1Result: null,
                    fighter2Result: null,
                  });
                }
              } catch (error) {
                console.error(
                  `Error linking fighters for fight "${fight.fighter1} vs ${fight.fighter2}":`,
                  error
                );
                // Continue with next fight even if this one fails
                // 即使這個對戰失敗，繼續處理下一個
              }
            }
          }
        } catch (error) {
          console.error(
            `Error parsing fight card for event ${eventId}:`,
            error
          );
          // Don't fail the entire sync if fight card parsing fails
          // 如果對戰卡解析失敗，不要讓整個同步失敗
        }
      } catch (error) {
        console.error(
          `Error upserting event ${unifiedEvent.external_id}:`,
          error
        );
        errors++;
      }
    }
  } catch (error) {
    console.error("Error syncing events from external API:", error);
    errors++;
    throw error;
  }

  return { created, updated, merged, errors };
}

/**
 * Determine event status based on fight date
 * 試合日付に基づいてイベントステータスを決定
 */
function determineEventStatus(fightDate: Date): Event["status"] {
  const now = new Date();
  const eventDate = new Date(fightDate);

  // イベントが過去の場合 / If event is in the past
  if (eventDate < now) {
    return "SETTLED";
  }

  // イベントが24時間以内の場合 / If event is within 24 hours
  const hoursUntilEvent =
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilEvent <= 24) {
    return "OPEN";
  }

  return "PENDING";
}

/**
 * Get event by external ID
 * 外部IDでイベントを取得
 */
export async function getEventByExternalId(
  externalId: string,
  source: ExternalEventSource
): Promise<Event | null> {
  const event = await prisma.event.findUnique({
    where: {
      external_id_external_source: {
        external_id: externalId,
        external_source: source,
      },
    },
  });

  return event as Event | null;
}
