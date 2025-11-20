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
import { parseFightCard } from "@/lib/utils/fight-card-parser";
import type {
  Event,
  UnifiedEventData,
  ExternalEventSource,
  SportType,
} from "@/lib/types";
import { TheSportsDBClient } from "@/lib/adapters/thesportsdb";

/**
 * Get weekly combat events (boxing, UFC, MMA)
 * 今週の格闘技イベントを取得（ボクシング、UFC、MMA）
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
 * Sync events from external API (TheSportsDB)
 * 外部API（TheSportsDB）からイベントを同期
 */
export async function syncEventsFromExternalAPI(
  source: ExternalEventSource = "thesportsdb"
): Promise<{
  created: number;
  updated: number;
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

    // トランザクションで一括upsert
    // Batch upsert in transaction
    for (const unifiedEvent of unifiedEvents) {
      try {
        const existing = await prisma.event.findFirst({
          where: {
            external_id: unifiedEvent.external_id,
            external_source: source,
          },
        });

        let eventId: string;

        if (existing) {
          // 既存イベントを更新
          // Update existing event
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
          // 新規イベントを作成
          // Create new event
          const newEvent = await prisma.event.create({
            data: {
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

        // 對戰卡を解析して選手をリンク
        // Parse fight card and link fighters
        try {
          const strResult = unifiedEvent.external_data?.strResult as
            | string
            | undefined;
          if (strResult) {
            const fights = parseFightCard(strResult);

            for (const fight of fights) {
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
                  // 選手をイベントにリンク
                  // Link fighters to event
                  await linkFightToEvent(fighter1.id, fighter2.id, eventId, {
                    weightClass: fight.weightClass,
                    method: fight.method || null,
                    round: fight.round ? parseInt(fight.round) : null,
                    time: fight.time || null,
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

  return { created, updated, errors };
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
