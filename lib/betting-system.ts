import { prisma } from "@/lib/db";
import { Decimal } from "decimal.js";
import { createAuditLog } from "@/lib/services/audit";

export const RAKE_PERCENTAGE = 0.1; // 10% house take

/**
 * Calculate current pool odds for a specific event
 */
export async function calculatePoolOdds(eventId: string) {
  const bets = await prisma.bettingLog.findMany({
    where: { eventId, settlement_status: { not: "VOID" } },
  });

  const totalPool = bets.reduce(
    (sum, bet) => sum.add(new Decimal(bet.bet_amount)),
    new Decimal(0)
  );
  const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);

  // Group bets by target_winner_id
  const betsByOutcome: Record<string, Decimal> = {};

  bets.forEach((bet) => {
    const target = bet.target_winner_id;
    if (!betsByOutcome[target]) {
      betsByOutcome[target] = new Decimal(0);
    }
    betsByOutcome[target] = betsByOutcome[target].add(
      new Decimal(bet.bet_amount)
    );
  });

  // Calculate odds for each outcome
  // Odds = Net Pool / Total Bets on Outcome
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
 * Settle an event and distribute payouts
 * イベントを決済し、配当を分配
 */
export async function settleEvent(
  eventId: string,
  winnerId: string,
  adminId: string,
  ipAddress: string = "unknown",
  winMethod?: string,
  winRound?: number
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get event to validate
    // イベントを取得して検証
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Validate event status
    // イベントステータスを検証
    if (event.status !== "OPEN" && event.status !== "CLOSED") {
      throw new Error("Event cannot be settled");
    }

    // Validate winner_id exists in fighter_1_id or fighter_2_id
    // winner_idがfighter_1_idまたはfighter_2_idに存在することを確認
    // Note: fighter_1_id and fighter_2_id may not exist in all events
    // 注意: fighter_1_idとfighter_2_idはすべてのイベントに存在しない場合がある
    const eventWithFighters = event as any; // Type assertion for fighter IDs
    if (
      eventWithFighters.fighter_1_id &&
      eventWithFighters.fighter_2_id &&
      winnerId !== eventWithFighters.fighter_1_id &&
      winnerId !== eventWithFighters.fighter_2_id
    ) {
      throw new Error("Winner ID must be one of the event fighters");
    }

    // 2. Get all bets for the event
    // イベントのすべてのベットを取得
    const bets = await tx.bettingLog.findMany({
      where: { eventId, settlement_status: "PENDING" },
    });

    if (bets.length === 0) {
      // No bets to settle
      // 決済するベットがない
      const updateDataNoBets: any = {
        status: "SETTLED",
        winner_id: winnerId,
        is_manual_override: true,
      };
      if (winMethod !== undefined) {
        updateDataNoBets.win_method = winMethod || null;
      }
      if (winRound !== undefined) {
        updateDataNoBets.win_round = winRound || null;
      }
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: updateDataNoBets,
      });

      // Create Audit Log
      // 監査ログを作成
      await createAuditLog(
        adminId,
        "SETTLE_EVENT",
        `Settled event ${eventId}. Winner: ${winnerId}. No bets to process.`,
        ipAddress
      );

      return {
        message: "Event settled. No bets to process.",
        event: updatedEvent,
      };
    }

    // 3. Calculate Pool
    // プールを計算
    const totalPool = bets.reduce(
      (sum, bet) => sum.add(new Decimal(bet.bet_amount)),
      new Decimal(0)
    );
    const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);
    const rakeAmount = totalPool.mul(RAKE_PERCENTAGE);

    // 4. Calculate Winners
    // 勝者を計算
    const winningBets = bets.filter((bet) => bet.target_winner_id === winnerId);
    const totalWinningAmount = winningBets.reduce(
      (sum, bet) => sum.add(new Decimal(bet.bet_amount)),
      new Decimal(0)
    );

    // 5. Process Payouts
    // 配当を処理
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

    // 6. Mark losing bets
    // 負けたベットをマーク
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

    // 7. Verification: Total Payouts + Rake = Total Pool
    // 検証: 総配当 + 手数料 = 総プール
    const totalDistributed = totalPayouts.add(rakeAmount);
    const difference = totalDistributed.sub(totalPool).abs();

    // Allow small rounding differences (less than 0.01)
    // 小さな丸め誤差を許可（0.01未満）
    if (difference.gte(0.01)) {
      const errorMessage = `Settlement verification failed: Total Pool (${totalPool.toString()}) != Total Payouts (${totalPayouts.toString()}) + Rake (${rakeAmount.toString()}) = ${totalDistributed.toString()}. Difference: ${difference.toString()}`;

      // Create Audit Log for verification failure
      // 検証失敗の監査ログを作成
      await createAuditLog(
        adminId,
        "SETTLE_EVENT_FAILED",
        errorMessage,
        ipAddress
      );

      throw new Error(errorMessage);
    }

    // 8. Update Event Status
    // イベントステータスを更新
    const updateData: any = {
      status: "SETTLED",
      winner_id: winnerId,
      is_manual_override: true,
    };
    if (winMethod !== undefined) {
      updateData.win_method = winMethod || null;
    }
    if (winRound !== undefined) {
      updateData.win_round = winRound || null;
    }
    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: updateData,
    });

    // 9. Create Audit Log
    // 監査ログを作成
    const auditDescription = `Settled event ${eventId} (${
      event.name
    }). Winner: ${winnerId}. Total Pool: ${totalPool.toString()}, Net Pool: ${netPool.toString()}, Rake: ${rakeAmount.toString()}, Total Payouts: ${totalPayouts.toString()}, Winning Bets: ${
      winningBets.length
    }, Losing Bets: ${losingBets.length}, Payout Ratio: ${
      totalWinningAmount.gt(0)
        ? netPool.div(totalWinningAmount).toFixed(4)
        : "N/A"
    }`;

    await createAuditLog(adminId, "SETTLE_EVENT", auditDescription, ipAddress);

    return {
      event: updatedEvent,
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
    };
  });
}
