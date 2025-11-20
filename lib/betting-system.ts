import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export const RAKE_PERCENTAGE = 0.10; // 10% house take

/**
 * Calculate current pool odds for a specific event
 */
export async function calculatePoolOdds(eventId: string) {
  const bets = await prisma.bettingLog.findMany({
    where: { eventId, settlement_status: { not: "VOID" } },
  });

  const totalPool = bets.reduce((sum, bet) => sum.add(new Decimal(bet.bet_amount)), new Decimal(0));
  const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);

  // Group bets by target_winner_id
  const betsByOutcome: Record<string, Decimal> = {};
  
  bets.forEach((bet) => {
    const target = bet.target_winner_id;
    if (!betsByOutcome[target]) {
      betsByOutcome[target] = new Decimal(0);
    }
    betsByOutcome[target] = betsByOutcome[target].add(new Decimal(bet.bet_amount));
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
 */
export async function settleEvent(eventId: string, winnerId: string, adminId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get all bets for the event
    const bets = await tx.bettingLog.findMany({
      where: { eventId, settlement_status: "PENDING" },
    });

    if (bets.length === 0) {
      // No bets to settle
      await tx.event.update({
        where: { id: eventId },
        data: { status: "SETTLED", winner_id: winnerId },
      });
      return { message: "Event settled. No bets to process." };
    }

    // 2. Calculate Pool
    const totalPool = bets.reduce((sum, bet) => sum.add(new Decimal(bet.bet_amount)), new Decimal(0));
    const netPool = totalPool.mul(1 - RAKE_PERCENTAGE);

    // 3. Calculate Winners
    const winningBets = bets.filter((bet) => bet.target_winner_id === winnerId);
    const totalWinningAmount = winningBets.reduce((sum, bet) => sum.add(new Decimal(bet.bet_amount)), new Decimal(0));

    // 4. Process Payouts
    if (totalWinningAmount.gt(0)) {
      // Calculate payout ratio: Net Pool / Total Winning Amount
      // Each winner gets: Bet Amount * Ratio
      // Which is equivalent to: (Bet Amount / Total Winning Amount) * Net Pool
      const payoutRatio = netPool.div(totalWinningAmount);

      for (const bet of winningBets) {
        const payout = new Decimal(bet.bet_amount).mul(payoutRatio);
        
        // Update Bet Log
        await tx.bettingLog.update({
          where: { id: bet.id },
          data: {
            settlement_status: "WON",
            final_payout: payout,
          },
        });

        // Update User Balance
        await tx.user.update({
          where: { userId: bet.userId },
          data: {
            virtual_score: { increment: payout },
          },
        });
      }
    } else {
      // House takes all if no one won? Or refund?
      // Usually in pool betting, if no one wins the specific outcome, rules vary.
      // For simplicity here: House takes all (since no winning tickets).
      // Or we could refund. Let's stick to "House takes all" for now as it's simpler, 
      // but in reality, often it carries over.
      // Let's just mark them as LOST.
    }

    // 5. Mark losing bets
    const losingBets = bets.filter((bet) => bet.target_winner_id !== winnerId);
    for (const bet of losingBets) {
      await tx.bettingLog.update({
        where: { id: bet.id },
        data: {
          settlement_status: "LOST",
          final_payout: 0,
        },
      });
    }

    // 6. Update Event Status
    const updatedEvent = await tx.event.update({
      where: { id: eventId },
      data: {
        status: "SETTLED",
        winner_id: winnerId,
      },
    });

    // 7. Create Audit Log
    await tx.auditLog.create({
      data: {
        adminId,
        action_type: "SETTLE_EVENT",
        description: `Settled event ${eventId}. Winner: ${winnerId}. Total Pool: ${totalPool}. Payout Ratio: ${totalWinningAmount.gt(0) ? netPool.div(totalWinningAmount).toFixed(2) : "N/A"}`,
      },
    });

    return updatedEvent;
  });
}
