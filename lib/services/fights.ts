/**
 * Fights Service Layer
 * 對戰服務層
 * Business logic for fight management and data retrieval
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { FightWithDetails } from "@/lib/types";

/**
 * Get fight with full details including event, fighters, and statistics
 * 獲取對戰完整詳情（包含賽事、選手和統計）
 * 
 * @param fightId Fight ID
 * @returns Fight with event, fighters, odds, and fighter statistics
 */
export async function getFightWithDetails(fightId: string) {
  return unstable_cache(
    async () => {
      const fight = await prisma.fight.findUnique({
        where: { id: fightId },
        include: {
          fighter: true,
          opponent: true,
          event: true,
          _count: {
            select: {
              bets: true,
            },
          },
        },
      });

      if (!fight) {
        return null;
      }

      // 計算選手統計（勝負平）
      // Calculate fighter statistics (wins, losses, draws)
      const [fighterStats, opponentStats] = await Promise.all([
        calculateFighterStats(fight.fighter_id),
        fight.opponent_id ? calculateFighterStats(fight.opponent_id) : null,
      ]);

      return {
        ...fight,
        fighterStats,
        opponentStats,
      };
    },
    [`fight-details-${fightId}`],
    {
      tags: ["fights", `fight-${fightId}`, `event-${fightId}`],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();
}

/**
 * Get all fights for a fighter (both as fighter and as opponent)
 * 獲取選手的所有對戰（無論是作為fighter還是opponent）
 * 
 * @param fighterId Fighter ID
 * @returns All fights with event and opponent details
 */
async function getFighterAllFights(fighterId: string) {
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
      event: true,
    },
    orderBy: {
      event: {
        fight_date: "desc",
      },
    },
  });
}

/**
 * Calculate fighter statistics from fight history
 * 從對戰歷史計算選手統計（包含所有對戰，無論是fighter還是opponent）
 * 
 * @param fighterId Fighter ID
 * @returns Fighter statistics (wins, losses, draws, total)
 */
async function calculateFighterStats(fighterId: string) {
  // 使用統一查詢函數獲取所有對戰
  // Use unified query function to get all fights
  const fights = await getFighterAllFights(fighterId);

  let wins = 0;
  let losses = 0;
  let draws = 0;

  fights.forEach((fight) => {
    if (!fight.result) return;
    
    // 判斷該選手在對戰中的角色
    // Determine fighter's role in the fight
    const isFighter = fight.fighter_id === fighterId;
    const result = fight.result.toLowerCase();
    
    // 結果是從fighter角度記錄的，需要根據角色轉換
    // Result is recorded from fighter's perspective, need to convert based on role
    if (isFighter) {
      // 選手是fighter，結果直接使用
      // Fighter is the fighter, use result directly
      if (result.includes("win")) {
        wins++;
      } else if (result.includes("loss")) {
        losses++;
      } else if (result.includes("draw") || result === "nc") {
        draws++;
      }
    } else {
      // 選手是opponent，結果需要反轉
      // Fighter is the opponent, need to reverse the result
      if (result.includes("win")) {
        losses++; // fighter贏了，opponent輸了
      } else if (result.includes("loss")) {
        wins++; // fighter輸了，opponent贏了
      } else if (result.includes("draw") || result === "nc") {
        draws++;
      }
    }
  });

  return {
    wins,
    losses,
    draws,
    total: fights.length,
  };
}

/**
 * Get fighter recent fights (last N fights)
 * 獲取選手最近對戰（最近N場，包含作為fighter和opponent的所有對戰）
 * 
 * @param fighterId Fighter ID
 * @param limit Number of fights to return
 * @returns Recent fights with opponent and event details
 */
export async function getFighterRecentFights(
  fighterId: string,
  limit: number = 5
) {
  return unstable_cache(
    async () => {
      return prisma.fight.findMany({
        where: {
          OR: [
            { fighter_id: fighterId },
            { opponent_id: fighterId },
          ],
        },
        include: {
          fighter: {
            select: {
              id: true,
              slug: true,
              name: true,
              thumb: true,
              cutout: true,
            },
          },
          opponent: {
            select: {
              id: true,
              slug: true,
              name: true,
              thumb: true,
              cutout: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              fight_date: true,
              status: true,
            },
          },
        },
        orderBy: {
          event: {
            fight_date: "desc",
          },
        },
        take: limit,
      });
    },
    [`fighter-recent-fights-${fighterId}-${limit}`],
    {
      tags: ["fights", `fighter-${fighterId}`],
      revalidate: 300, // 5分鐘ごとに再検証 / Revalidate every 5 minutes
    }
  )();
}

