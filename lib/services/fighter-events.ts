/**
 * Fighter Event Service
 * 選手賽事關聯服務層
 * Handles linking fighters to events and retrieving fight history
 */

import { prisma } from "@/lib/db";

/**
 * Link fighter to event
 * 建立選手-賽事關聯
 */
export async function linkFighterToEvent(
  fighterId: string,
  eventId: string,
  options?: {
    opponentId?: string | null;
    result?: string | null;
    method?: string | null;
    round?: number | null;
    time?: string | null;
    weightClass?: string | null;
  }
): Promise<void> {
  try {
    // Check if link already exists
    // 檢查關聯是否已存在
    const existing = await prisma.fighterEvent.findFirst({
      where: {
        fighter_id: fighterId,
        event_id: eventId,
      },
    });

    if (existing) {
      // Update existing link
      // 更新現有關聯
      await prisma.fighterEvent.update({
        where: { id: existing.id },
        data: {
          opponent_id: options?.opponentId || existing.opponent_id,
          result: options?.result || existing.result,
          method: options?.method || existing.method,
          round: options?.round ?? existing.round,
          time: options?.time || existing.time,
          weight_class: options?.weightClass || existing.weight_class,
        },
      });
    } else {
      // Create new link
      // 建立新關聯
      await prisma.fighterEvent.create({
        data: {
          fighter_id: fighterId,
          event_id: eventId,
          opponent_id: options?.opponentId || null,
          result: options?.result || null,
          method: options?.method || null,
          round: options?.round || null,
          time: options?.time || null,
          weight_class: options?.weightClass || null,
        },
      });
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
 * 取得選手完整賽事歷史
 */
export async function getFighterEventHistory(fighterId: string) {
  return prisma.fighterEvent.findMany({
    where: { fighter_id: fighterId },
    include: {
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
      opponent: true,
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
 */
export async function linkFightToEvent(
  fighter1Id: string,
  fighter2Id: string,
  eventId: string,
  options?: {
    fighter1Result?: string | null;
    fighter2Result?: string | null;
    method?: string | null;
    round?: number | null;
    time?: string | null;
    weightClass?: string | null;
  }
): Promise<void> {
  // Link fighter 1
  await linkFighterToEvent(fighter1Id, eventId, {
    opponentId: fighter2Id,
    result: options?.fighter1Result || null,
    method: options?.method || null,
    round: options?.round || null,
    time: options?.time || null,
    weightClass: options?.weightClass || null,
  });

  // Link fighter 2
  await linkFighterToEvent(fighter2Id, eventId, {
    opponentId: fighter1Id,
    result: options?.fighter2Result || null,
    method: options?.method || null,
    round: options?.round || null,
    time: options?.time || null,
    weightClass: options?.weightClass || null,
  });
}

