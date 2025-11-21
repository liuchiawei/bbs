/**
 * Betting Service Layer
 * 投注服務層
 * Business logic for betting operations
 */

import { prisma } from "@/lib/db";
import { Decimal } from "decimal.js";
import { createAuditLog, getClientIpAddress } from "./audit";
import { unstable_cache } from "next/cache";
import { calculatePoolOdds } from "@/lib/betting-system";
import type { BettingOdds } from "@/lib/types";

/**
 * Place a bet
 * 下注
 */
export async function placeBet(
  userId: string,
  eventId: string,
  targetWinnerId: string,
  amount: number,
  ipAddress: string
) {
  const betAmount = new Decimal(amount);

  return await prisma.$transaction(async (tx) => {
    // 1. Get User with latest balance
    // ユーザーの最新残高を取得
    const currentUser = await tx.user.findUnique({
      where: { userId },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // 2. Check balance
    // 残高を確認
    if (new Decimal(currentUser.virtual_score).lt(betAmount)) {
      throw new Error("Insufficient funds");
    }

    // 3. Check Event Status
    // イベントステータスを確認
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // Allow betting for PENDING and OPEN status
    // PENDING と OPEN ステータスでベットを許可
    // Block betting for SETTLED, CLOSED, CANCELLED
    // SETTLED、CLOSED、CANCELLED ステータスでベットをブロック
    if (
      event.status !== "OPEN" &&
      event.status !== "PENDING"
    ) {
      throw new Error("Betting is closed for this event");
    }

    // 4. Deduct Points
    // ポイントを減算
    await tx.user.update({
      where: { userId },
      data: {
        virtual_score: { decrement: betAmount },
      },
    });

    // 5. Create Bet Log
    // ベットログを作成
    const newBet = await tx.bettingLog.create({
      data: {
        userId,
        eventId,
        bet_amount: betAmount,
        target_winner_id: targetWinnerId,
        odds_snapshot: new Decimal(0), // Pool odds are dynamic, snapshot 0 or current est.
        settlement_status: "PENDING",
      },
    });

    // 6. Create Audit Log (for admin tracking, but user actions also logged)
    // 監査ログを作成（管理者追跡用、ユーザーアクションも記録）
    await createAuditLog(
      userId, // For user bets, use userId as adminId
      "PLACE_BET",
      `User ${userId} placed bet of ${betAmount.toString()} on event ${eventId} for winner ${targetWinnerId}`,
      ipAddress
    );

    return newBet;
  });
}

/**
 * Get betting odds for an event (with cache)
 * イベントのオッズを取得（キャッシュ付き）
 */
export async function getBettingOdds(eventId: string): Promise<BettingOdds> {
  return unstable_cache(
    async () => {
      return await calculatePoolOdds(eventId);
    },
    [`betting-odds-${eventId}`],
    {
      tags: [`event-odds-${eventId}`, `event-${eventId}`],
      revalidate: 5, // 5秒ごとに再検証 / Revalidate every 5 seconds
    }
  )();
}

/**
 * Rollback a single bet
 * 単一のベットをロールバック
 */
export async function rollbackBet(
  betId: string,
  adminId: string,
  ipAddress: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get bet
    // ベットを取得
    const bet = await tx.bettingLog.findUnique({
      where: { id: betId },
    });

    if (!bet) {
      throw new Error("Bet not found");
    }

    // 2. Check bet status (must be PENDING)
    // ベットステータスを確認（PENDINGである必要がある）
    if (bet.settlement_status !== "PENDING") {
      throw new Error("Bet has already been settled");
    }

    // 3. Restore user balance
    // ユーザー残高を復元
    await tx.user.update({
      where: { userId: bet.userId },
      data: {
        virtual_score: { increment: bet.bet_amount },
      },
    });

    // 4. Update Bet Log status to VOID
    // ベットログステータスをVOIDに更新
    await tx.bettingLog.update({
      where: { id: betId },
      data: {
        settlement_status: "VOID",
      },
    });

    // 5. Create Audit Log
    // 監査ログを作成
    await createAuditLog(
      adminId,
      "ROLLBACK_BET",
      `Admin ${adminId} rolled back bet ${betId} for user ${bet.userId} on event ${bet.eventId}. Amount: ${bet.bet_amount}`,
      ipAddress
    );

    return bet;
  });
}

/**
 * Rollback all bets for an event
 * イベントのすべてのベットをロールバック
 */
export async function rollbackEvent(
  eventId: string,
  adminId: string,
  ipAddress: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get event
    // イベントを取得
    const event = await tx.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    // 2. Check event status (must be SETTLED)
    // イベントステータスを確認（SETTLEDである必要がある）
    if (event.status !== "SETTLED") {
      throw new Error("Event cannot be rolled back");
    }

    // 3. Get all bets for the event
    // イベントのすべてのベットを取得
    const bets = await tx.bettingLog.findMany({
      where: { eventId },
    });

    // 4. Restore user balances and update bet statuses
    // ユーザー残高を復元し、ベットステータスを更新
    for (const bet of bets) {
      // Restore balance only for bets that were settled (WON or LOST)
      // 決済済み（WONまたはLOST）のベットのみ残高を復元
      if (bet.settlement_status === "WON") {
        // If won, we need to deduct the payout and restore the bet amount
        // 勝った場合、支払いを差し引き、ベット額を復元する必要がある
        const payout = bet.final_payout || new Decimal(0);
        const betAmount = new Decimal(bet.bet_amount);
        // Net change: restore bet amount, deduct payout
        // 純変化：ベット額を復元し、支払いを差し引く
        await tx.user.update({
          where: { userId: bet.userId },
          data: {
            virtual_score: { increment: betAmount.sub(payout) },
          },
        });
      } else if (bet.settlement_status === "LOST") {
        // If lost, restore the bet amount
        // 負けた場合、ベット額を復元
        await tx.user.update({
          where: { userId: bet.userId },
          data: {
            virtual_score: { increment: bet.bet_amount },
          },
        });
      } else if (bet.settlement_status === "PENDING") {
        // If pending, restore the bet amount
        // 保留中の場合、ベット額を復元
        await tx.user.update({
          where: { userId: bet.userId },
          data: {
            virtual_score: { increment: bet.bet_amount },
          },
        });
      }

      // Update bet status to VOID
      // ベットステータスをVOIDに更新
      await tx.bettingLog.update({
        where: { id: bet.id },
        data: {
          settlement_status: "VOID",
          final_payout: null,
        },
      });
    }

    // 5. Update Event status back to OPEN (or CLOSED if event date has passed)
    // イベントステータスをOPENに戻す（またはイベント日が過ぎている場合はCLOSED）
    const now = new Date();
    const eventDate = new Date(event.fight_date);
    const newStatus = eventDate < now ? "CLOSED" : "OPEN";

    await tx.event.update({
      where: { id: eventId },
      data: {
        status: newStatus,
        winner_id: null,
        win_method: null,
        win_round: null,
        is_manual_override: false,
      },
    });

    // 6. Create Audit Log
    // 監査ログを作成
    await createAuditLog(
      adminId,
      "ROLLBACK_EVENT",
      `Admin ${adminId} rolled back event ${eventId}. ${bets.length} bets affected.`,
      ipAddress
    );

    return {
      event,
      betsRolledBack: bets.length,
    };
  });
}

