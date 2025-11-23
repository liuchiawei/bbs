/**
 * Fight Service
 * 對戰服務層
 * Handles linking fighters to events and retrieving fight history
 */

import { prisma } from "@/lib/db";

/**
 * Link fighter to event
 * 建立選手-賽事關聯
 * 
 * @param fighterId Fighter ID
 * @param eventId Event ID
 * @param options 對戰選項（包含對戰類型、順序、投注設定等）
 * @returns Created or updated Fight ID
 */
export async function linkFighterToEvent(
  fighterId: string,
  eventId: string,
  options?: {
    opponentId?: string | null;
    fightType?: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
    fightOrder?: number;
    weightClass?: string | null;
    result?: string | null;
    method?: string | null;
    round?: number | null;
    time?: string | null;
    isBettable?: boolean;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  }
): Promise<string> {
  try {
    // Check if link already exists (by fighter_id + event_id)
    // 檢查關聯是否已存在（通過 fighter_id + event_id）
    const existing = await prisma.fight.findFirst({
      where: {
        fighter_id: fighterId,
        event_id: eventId,
      },
    });

    if (existing) {
      // Update existing link
      // 更新現有關聯
      const updated = await prisma.fight.update({
        where: { id: existing.id },
        data: {
          opponent_id: options?.opponentId ?? existing.opponent_id,
          fight_type: options?.fightType || existing.fight_type,
          fight_order: options?.fightOrder ?? existing.fight_order,
          weight_class: options?.weightClass ?? existing.weight_class,
          result: options?.result ?? existing.result,
          method: options?.method ?? existing.method,
          round: options?.round ?? existing.round,
          time: options?.time ?? existing.time,
          is_bettable: options?.isBettable ?? existing.is_bettable,
          status: options?.status || existing.status,
        },
      });
      return updated.id;
    } else {
      // Create new link
      // 建立新關聯
      // 如果沒有指定fight_order，自動分配（查詢現有最大順序+1）
      // If fight_order not specified, auto-assign (query max order + 1)
      let fightOrder = options?.fightOrder;
      if (fightOrder === undefined) {
        const maxOrder = await prisma.fight.findFirst({
          where: { event_id: eventId },
          orderBy: { fight_order: "desc" },
          select: { fight_order: true },
        });
        fightOrder = (maxOrder?.fight_order || 0) + 1;
      }

      // 如果有opponentId，創建雙向記錄；否則只創建單向記錄（單人賽事）
      // If opponentId exists, create bidirectional records; otherwise create single record (single fighter event)
      if (options?.opponentId) {
        // 使用transaction確保原子性
        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
          // 創建fighter的Fight記錄
          // Create Fight record for fighter
          const fighterFight = await tx.fight.create({
            data: {
              fighter_id: fighterId,
              event_id: eventId,
              opponent_id: options.opponentId,
              fight_type: options?.fightType || "MAIN",
              fight_order: fightOrder!,
              weight_class: options?.weightClass || null,
              result: options?.result || null,
              method: options?.method || null,
              round: options?.round || null,
              time: options?.time || null,
              is_bettable: options?.isBettable !== false, // 預設true
              status: options?.status || "CONFIRMED",
            },
          });

          // 創建opponent的Fight記錄（使用相同的對戰順序）
          // Create Fight record for opponent (using same fight order)
          await tx.fight.create({
            data: {
              fighter_id: options.opponentId,
              event_id: eventId,
              opponent_id: fighterId,
              fight_type: options?.fightType || "MAIN",
              fight_order: fightOrder!,
              weight_class: options?.weightClass || null,
              result: null, // opponent的結果需要單獨設置
              method: options?.method || null,
              round: options?.round || null,
              time: options?.time || null,
              is_bettable: options?.isBettable !== false, // 預設true
              status: options?.status || "CONFIRMED",
            },
          });

          return fighterFight.id;
        });
        return result;
      } else {
        // 單人賽事，只創建單向記錄
        // Single fighter event, create single record only
        const created = await prisma.fight.create({
          data: {
            fighter_id: fighterId,
            event_id: eventId,
            opponent_id: null,
            fight_type: options?.fightType || "MAIN",
            fight_order: fightOrder!,
            weight_class: options?.weightClass || null,
            result: options?.result || null,
            method: options?.method || null,
            round: options?.round || null,
            time: options?.time || null,
            is_bettable: options?.isBettable !== false, // 預設true
            status: options?.status || "CONFIRMED",
          },
        });
        return created.id;
      }
    }
  } catch (error) {
    console.error(
      `Error linking fighter ${fighterId} to event ${eventId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get fighter event history
 * 取得選手完整賽事歷史（包含作為fighter和opponent的所有對戰）
 */
export async function getFighterEventHistory(fighterId: string) {
  return prisma.fight.findMany({
    where: {
      OR: [
        { fighter_id: fighterId },
        { opponent_id: fighterId },
      ],
    },
    include: {
      fighter: true,
      opponent: true,
      event: {
        include: {
          _count: {
            select: {
              bets: true,
              posts: true,
            },
          },
        },
      },
    },
    orderBy: {
      event: {
        fight_date: "desc",
      },
    },
  });
}

/**
 * Link both fighters to event (for a fight)
 * 將兩位選手都連結到賽事（用於一場對戰）
 * 
 * @param fighter1Id Fighter 1 ID
 * @param fighter2Id Fighter 2 ID
 * @param eventId Event ID
 * @param options 對戰選項（包含對戰類型、順序、結果等）
 * @returns Created Fight IDs [fighter1FightId, fighter2FightId]
 */
export async function linkFightToEvent(
  fighter1Id: string,
  fighter2Id: string,
  eventId: string,
  options?: {
    fightType?: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
    fightOrder?: number;
    weightClass?: string | null;
    fighter1Result?: string | null;
    fighter2Result?: string | null;
    method?: string | null;
    round?: number | null;
    time?: string | null;
    isBettable?: boolean;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  }
): Promise<[string, string]> {
  // 如果沒有指定fight_order，自動分配
  // If fight_order not specified, auto-assign
  let fightOrder = options?.fightOrder;
  if (fightOrder === undefined) {
    const maxOrder = await prisma.fight.findFirst({
      where: { event_id: eventId },
      orderBy: { fight_order: "desc" },
      select: { fight_order: true },
    });
    fightOrder = (maxOrder?.fight_order || 0) + 1;
  }

  // Link fighter 1
  // 連結選手1
  const fighter1EventId = await linkFighterToEvent(fighter1Id, eventId, {
    opponentId: fighter2Id,
    fightType: options?.fightType || "MAIN",
    fightOrder,
    weightClass: options?.weightClass || null,
    result: options?.fighter1Result || null,
    method: options?.method || null,
    round: options?.round || null,
    time: options?.time || null,
    isBettable: options?.isBettable,
    status: options?.status,
  });

  // Link fighter 2 (使用相同的fight_order)
  // 連結選手2（使用相同的fight_order）
  const fighter2EventId = await linkFighterToEvent(fighter2Id, eventId, {
    opponentId: fighter1Id,
    fightType: options?.fightType || "MAIN",
    fightOrder, // 使用相同的順序
    weightClass: options?.weightClass || null,
    result: options?.fighter2Result || null,
    method: options?.method || null,
    round: options?.round || null,
    time: options?.time || null,
    isBettable: options?.isBettable,
    status: options?.status,
  });

  return [fighter1EventId, fighter2EventId];
}

/**
 * Get fights by event ID (按順序)
 * 獲取賽事的所有對戰（按順序）
 * 
 * @param eventId Event ID
 * @returns Fight array ordered by fight_order
 */
export async function getFightsByEvent(eventId: string) {
  return prisma.fight.findMany({
    where: { event_id: eventId },
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
  });
}

/**
 * Update fight result
 * 更新對戰結果
 * 
 * @param fightId Fight ID
 * @param result Result from fighter's perspective (Win/Loss/Draw/NC)
 * @param method Win method (KO/TKO/Decision等)
 * @param round Round number
 * @param time Time in round
 */
export async function updateFightResult(
  fightId: string,
  result: string,
  method?: string | null,
  round?: number | null,
  time?: string | null
) {
  return prisma.fight.update({
    where: { id: fightId },
    data: {
      result,
      method: method || null,
      round: round || null,
      time: time || null,
      status: "COMPLETED",
    },
  });
}

