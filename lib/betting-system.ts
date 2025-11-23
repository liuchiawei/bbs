import { prisma } from "@/lib/db";
import { Decimal } from "decimal.js";
import { createAuditLog } from "@/lib/services/audit";

export const RAKE_PERCENTAGE = 0.1; // 10% house take

/**
 * Calculate current pool odds for a specific fight
 * 計算特定對戰的當前賠率池
 * 
 * @param fightId Fight ID
 * @param tx Optional Prisma transaction client (for use within transactions)
 * @returns BettingOdds for the fight
 * 
 * 基於該對戰的所有投注計算賠率，每個選手的賠率 = 淨池 / 該選手的總投注額
 * Calculates odds based on all bets for this fight, each fighter's odds = net pool / total bets on that fighter
 */
export async function calculateFightOdds(
  fightId: string,
  tx?: any
): Promise<{
  totalPool: number;
  netPool: number;
  odds: Record<string, number>;
  betsByOutcome: Record<string, number>;
}> {
  const prismaClient = tx || prisma;

  // 獲取該對戰的所有投注（排除VOID）
  // Get all bets for this fight (excluding VOID)
  const bets = await prismaClient.bettingLog.findMany({
    where: {
      fightId,
      settlement_status: { not: "VOID" },
    },
  });

  const totalPool = bets.reduce(
    (sum: Decimal, bet: { bet_amount: any }) => sum.add(new Decimal(bet.bet_amount)),
    new Decimal(0)
  );
  const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);

  // 按目標勝者ID分組投注
  // Group bets by target_winner_id
  const betsByOutcome: Record<string, Decimal> = {};

  bets.forEach((bet: { target_winner_id: string; bet_amount: any }) => {
    const target = bet.target_winner_id;
    if (!betsByOutcome[target]) {
      betsByOutcome[target] = new Decimal(0);
    }
    betsByOutcome[target] = betsByOutcome[target].add(
      new Decimal(bet.bet_amount)
    );
  });

  // 計算每個選手的賠率
  // Calculate odds for each fighter
  // 賠率 = 淨池 / 該選手的總投注額
  // Odds = Net Pool / Total Bets on Fighter
  const odds: Record<string, number> = {};

  Object.keys(betsByOutcome).forEach((outcomeId) => {
    const outcomeTotal = betsByOutcome[outcomeId];
    if (outcomeTotal.gt(0)) {
      // Use toNumber() for display purposes, handle precision carefully in actual calculations
      odds[outcomeId] = netPool.div(outcomeTotal).toNumber();
    } else {
      odds[outcomeId] = 0; // No bets yet
    }
  });

  return {
    totalPool: totalPool.toNumber(),
    netPool: netPool.toNumber(),
    odds,
    betsByOutcome: Object.fromEntries(
      Object.entries(betsByOutcome).map(([k, v]) => [k, v.toNumber()])
    ),
  };
}

/**
 * Calculate current pool odds for a specific event (deprecated)
 * 計算特定賽事的當前賠率池（已棄用）
 * @deprecated Use calculateFightOdds(fightId) instead
 */
export async function calculatePoolOdds(eventId: string) {
  // 向後兼容：返回第一個對戰的賠率（如果存在）
  // Backward compatibility: return odds for first fight if exists
  const firstFight = await prisma.fight.findFirst({
    where: { event_id: eventId },
    orderBy: { fight_order: "asc" },
  });

  if (firstFight) {
    return calculateFightOdds(firstFight.id);
  }

  // 如果沒有對戰，返回空賠率
  // If no fights, return empty odds
  return {
    totalPool: 0,
    netPool: 0,
    odds: {},
    betsByOutcome: {},
  };
}

/**
 * Settle a specific fight and distribute payouts
 * 結算特定對戰並分配派彩
 * 
 * @param fightId Fight ID
 * @param winnerId Winner ID (fighter_id或opponent_id)
 * @param adminId Admin ID for audit log
 * @param ipAddress IP address for audit log
 * @param winMethod Win method (optional)
 * @param winRound Win round (optional)
 * @returns Settlement result with statistics
 * 
 * 驗證對戰狀態、計算派彩、更新投注狀態、記錄審計日誌
 * Validates fight status, calculates payouts, updates bet statuses, records audit log
 */
export async function settleFight(
  fightId: string,
  winnerId: string,
  adminId: string,
  ipAddress: string = "unknown",
  winMethod?: string,
  winRound?: number
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get Fight to validate
    // 取得Fight以驗證
    const fight = await tx.fight.findUnique({
      where: { id: fightId },
      include: {
        event: true,
        fighter: true,
        opponent: true,
      },
    });

    if (!fight) {
      throw new Error("Fight not found");
    }

    // 2. Validate winner matches fight fighters
    // 驗證勝者匹配對戰選手
    if (
      winnerId !== fight.fighter_id &&
      winnerId !== fight.opponent_id
    ) {
      throw new Error("Winner ID must be one of the fight fighters");
    }

    // 3. Validate fight status
    // 驗證對戰狀態
    if (fight.status === "CANCELLED") {
      throw new Error("Cannot settle a cancelled fight");
    }

    // 4. Get all bets for this fight
    // 獲取該對戰的所有投注
    const bets = await tx.bettingLog.findMany({
      where: {
        fightId,
        settlement_status: "PENDING",
      },
    });

    if (bets.length === 0) {
      // No bets to settle - just update fight result
      // 沒有投注需要結算 - 僅更新對戰結果
      const result = winnerId === fight.fighter_id ? "Win" : "Loss";
      
      await tx.fight.update({
        where: { id: fightId },
        data: {
          result,
          method: winMethod || null,
          round: winRound || null,
          status: "COMPLETED",
        },
      });

      // Create Audit Log
      // 監査ログを作成
      await createAuditLog(
        adminId,
        "SETTLE_FIGHT",
        `Settled fight ${fightId} (event ${fight.event.id}). Winner: ${winnerId}. No bets to process.`,
        ipAddress
      );

      return {
        message: "Fight settled. No bets to process.",
        fight: fight,
        totalPool: 0,
        netPool: 0,
        rakeAmount: 0,
        totalPayouts: 0,
        winningBets: 0,
        losingBets: 0,
      };
    }

    // 5. Calculate Pool
    // 計算投注池
    const totalPool = bets.reduce(
      (sum, bet) => sum.add(new Decimal(bet.bet_amount)),
      new Decimal(0)
    );
    const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);
    const rakeAmount = totalPool.mul(RAKE_PERCENTAGE);

    // 6. Calculate Winners
    // 計算勝者
    const winningBets = bets.filter((bet) => bet.target_winner_id === winnerId);
    const totalWinningAmount = winningBets.reduce(
      (sum: Decimal, bet: { bet_amount: any }) => sum.add(new Decimal(bet.bet_amount)),
      new Decimal(0)
    );

    // 7. Process Payouts
    // 處理派彩
    let totalPayouts = new Decimal(0);

    if (totalWinningAmount.gt(0)) {
      // Calculate payout ratio: Net Pool / Total Winning Amount
      // Each winner gets: Bet Amount * Ratio
      // 配当比率を計算: ネットプール / 勝者への総ベット額
      // 各勝者は受け取る: ベット額 * 比率
      const payoutRatio = netPool.div(totalWinningAmount);

      for (const bet of winningBets) {
        const payout = new Decimal(bet.bet_amount).mul(payoutRatio);
        totalPayouts = totalPayouts.add(payout);

        // Update Bet Log
        // ベットログを更新
        await tx.bettingLog.update({
          where: { id: bet.id },
          data: {
            settlement_status: "WON",
            final_payout: payout,
          },
        });

        // Update User Balance
        // ユーザー残高を更新
        await tx.user.update({
          where: { userId: bet.userId },
          data: {
            virtual_score: { increment: payout },
          },
        });
      }
    }

    // 8. Mark losing bets
    // 標記失敗投注
    const losingBets = bets.filter((bet) => bet.target_winner_id !== winnerId);
    for (const bet of losingBets) {
      await tx.bettingLog.update({
        where: { id: bet.id },
        data: {
          settlement_status: "LOST",
          final_payout: new Decimal(0),
        },
      });
    }

    // 9. Verification: Total Payouts + Rake = Total Pool
    // 驗證：總派彩 + 手續費 = 總投注池
    const totalDistributed = totalPayouts.add(rakeAmount);
    const difference = totalDistributed.sub(totalPool).abs();

    // Allow small rounding differences (less than 0.01)
    // 小さな丸め誤差を許可（0.01未満）
    if (difference.gte(0.01)) {
      const errorMessage = `Settlement verification failed: Total Pool (${totalPool.toString()}) != Total Payouts (${totalPayouts.toString()}) + Rake (${rakeAmount.toString()}) = ${totalDistributed.toString()}. Difference: ${difference.toString()}`;

      // Create Audit Log for verification failure
      // 驗證失敗的審計日誌
      await createAuditLog(
        adminId,
        "SETTLE_FIGHT_FAILED",
        errorMessage,
        ipAddress
      );

      throw new Error(errorMessage);
    }

    // 10. Update Fight result and status
    // 更新Fight結果和狀態
    const result = winnerId === fight.fighter_id ? "Win" : "Loss";
    await tx.fight.update({
      where: { id: fightId },
      data: {
        result,
        method: winMethod || null,
        round: winRound || null,
        status: "COMPLETED",
      },
    });

    // 11. Check if all fights in event are completed, update event status if so
    // 檢查賽事所有對戰是否完成，如果是則更新賽事狀態
    const allFightsInEvent = await tx.fight.findMany({
      where: { event_id: fight.event.id },
    });
    const allCompleted = allFightsInEvent.every(
      (f) => f.status === "COMPLETED" || f.status === "CANCELLED"
    );

    if (allCompleted) {
      await tx.event.update({
        where: { id: fight.event.id },
        data: {
          status: "SETTLED",
        },
      });
    }

    // 12. Create Audit Log
    // 創建審計日誌
    const auditDescription = `Settled fight ${fightId} (${fight.fighter.name} vs ${fight.opponent?.name || "TBD"}) in event ${fight.event.id} (${fight.event.name}). Winner: ${winnerId}. Total Pool: ${totalPool.toString()}, Net Pool: ${netPool.toString()}, Rake: ${rakeAmount.toString()}, Total Payouts: ${totalPayouts.toString()}, Winning Bets: ${winningBets.length}, Losing Bets: ${losingBets.length}, Payout Ratio: ${
      totalWinningAmount.gt(0)
        ? netPool.div(totalWinningAmount).toFixed(4)
        : "N/A"
    }`;

    await createAuditLog(adminId, "SETTLE_FIGHT", auditDescription, ipAddress);

    return {
      fight: fight,
      totalPool: totalPool.toNumber(),
      netPool: netPool.toNumber(),
      rakeAmount: rakeAmount.toNumber(),
      totalPayouts: totalPayouts.toNumber(),
      winningBets: winningBets.length,
      losingBets: losingBets.length,
      verification: {
        totalDistributed: totalDistributed.toNumber(),
        difference: difference.toNumber(),
        verified: true,
      },
      eventStatusUpdated: allCompleted,
    };
  });
}

/**
 * Settle all fights in an event (batch operation)
 * 結算賽事所有對戰（批量操作）
 * 
 * @param eventId Event ID
 * @param fightResults Array of fight results { fightId, winnerId, winMethod?, winRound? }
 * @param adminId Admin ID
 * @param ipAddress IP address
 * @returns Settlement results for all fights
 * 
 * 批量結算賽事所有對戰，優化資料庫操作
 * Batch settle all fights in event, optimizes database operations
 */
export async function settleAllFightsInEvent(
  eventId: string,
  fightResults: Array<{
    fightId: string;
    winnerId: string;
    winMethod?: string;
    winRound?: number;
  }>,
  adminId: string,
  ipAddress: string = "unknown"
) {
  const results = [];

  // 批量結算所有對戰（順序執行以確保一致性）
  // Batch settle all fights (sequential execution to ensure consistency)
  for (const fightResult of fightResults) {
    try {
      const result = await settleFight(
        fightResult.fightId,
        fightResult.winnerId,
        adminId,
        ipAddress,
        fightResult.winMethod,
        fightResult.winRound
      );
      results.push({
        fightId: fightResult.fightId,
        success: true,
        result,
      });
    } catch (error) {
      results.push({
        fightId: fightResult.fightId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    eventId,
    totalFights: fightResults.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

/**
 * Settle an event (deprecated, use settleFight instead)
 * 結算賽事（已棄用，請使用settleFight）
 * @deprecated Use settleFight(fightId, ...) instead
 */
export async function settleEvent(
  eventId: string,
  winnerId: string,
  adminId: string,
  ipAddress: string = "unknown",
  winMethod?: string,
  winRound?: number
) {
  // 向後兼容：找到第一個對戰並結算
  // Backward compatibility: find first fight and settle
  const firstFight = await prisma.fight.findFirst({
    where: { event_id: eventId },
    orderBy: { fight_order: "asc" },
  });

  if (!firstFight) {
    throw new Error("No fights found for this event");
  }

  return settleFight(
    firstFight.id,
    winnerId,
    adminId,
    ipAddress,
    winMethod,
    winRound
  );
}
