/**
 * Betting Service Layer
 * 投注服務層
 * Business logic for betting operations
 */

import { prisma } from "@/lib/db";
import { Decimal } from "decimal.js";
import { createAuditLog, getClientIpAddress } from "./audit";
import { unstable_cache } from "next/cache";
import { calculateFightOdds } from "@/lib/betting-system";
import type { BettingOdds } from "@/lib/types";

/**
 * Place a bet on a specific fight
 * 對特定對戰下注
 * 
 * @param userId User ID
 * @param fightId Fight ID (對戰ID)
 * @param targetWinnerId Target winner ID (fighter_id或opponent_id)
 * @param amount Bet amount
 * @param ipAddress IP address for audit log
 * @returns Created BettingLog
 * 
 * 驗證對戰可投注、選手匹配、賽事狀態
 * Validates fight is bettable, fighter matches, event status
 */
export async function placeBet(
  userId: string,
  fightId: string,
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

    // 3. Get Fight (對戰資訊)
    // 取得Fight（對戰資訊）
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

    // 4. Validate fight is bettable
    // 驗證對戰可投注
    if (!fight.is_bettable) {
      throw new Error("Betting is not available for this fight");
    }

    // 5. Validate fight status
    // 驗證對戰狀態
    if (fight.status === "CANCELLED" || fight.status === "COMPLETED") {
      throw new Error("Betting is closed for this fight");
    }

    // 6. Validate target winner matches fight fighters
    // 驗證目標勝者匹配對戰選手
    if (
      targetWinnerId !== fight.fighter_id &&
      targetWinnerId !== fight.opponent_id
    ) {
      throw new Error("Target winner must be one of the fight fighters");
    }

    // 7. Check Event Status
    // イベントステータスを確認
    const event = fight.event;
    if (event.status !== "OPEN" && event.status !== "PENDING") {
      throw new Error("Betting is closed for this event");
    }

    // 8. Calculate current odds snapshot
    // 計算當前賠率快照
    // Note: calculateFightOdds accepts optional tx parameter for use within transactions
    // 注意：calculateFightOdds 接受可選的 tx 參數，用於在事務中使用
    const currentOdds = await calculateFightOdds(fightId, tx);
    const oddsSnapshot = new Decimal(currentOdds.odds[targetWinnerId] || 0);

    // 9. Deduct Points
    // ポイントを減算
    await tx.user.update({
      where: { userId },
      data: {
        virtual_score: { decrement: betAmount },
      },
    });

    // 10. Create Bet Log
    // ベットログを作成
    const newBet = await tx.bettingLog.create({
      data: {
        userId,
        eventId: event.id,
        fightId,
        bet_amount: betAmount,
        target_winner_id: targetWinnerId,
        odds_snapshot: oddsSnapshot,
        settlement_status: "PENDING",
      },
    });

    // 11. Create Audit Log
    // 監査ログを作成
    await createAuditLog(
      userId,
      "PLACE_BET",
      `User ${userId} placed bet of ${betAmount.toString()} on fight ${fightId} (event ${event.id}) for winner ${targetWinnerId}`,
      ipAddress
    );

    return newBet;
  });
}

/**
 * Get betting odds for a specific fight (with cache)
 * 獲取特定對戰的投注賠率（快取）
 * 
 * @param fightId Fight ID
 * @returns BettingOdds for the fight
 * 
 * 使用快取優化效能，5秒revalidate
 * Uses cache for performance optimization, 5 second revalidate
 */
export async function getFightOdds(fightId: string): Promise<BettingOdds> {
  return unstable_cache(
    async () => {
      return await calculateFightOdds(fightId);
    },
    [`fight-odds-${fightId}`],
    {
      tags: [`fight-odds-${fightId}`, `event-fights-${fightId}`],
      revalidate: 5, // 5秒ごとに再検証 / Revalidate every 5 seconds
    }
  )();
}

/**
 * Get betting summary for an event (all fights)
 * 獲取賽事所有對戰的投注統計
 * 
 * @param eventId Event ID
 * @returns Betting summary for all fights in the event
 * 
 * 批量查詢所有對戰的投注統計，避免N+1問題
 * Batch query betting stats for all fights, avoiding N+1 problem
 */
export async function getEventBettingSummary(eventId: string) {
  return unstable_cache(
    async () => {
      // 獲取賽事所有對戰
      // Get all fights for the event
      const fights = await prisma.fight.findMany({
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

      // 為每個對戰計算賠率
      // Calculate odds for each fight
      const fightsWithOdds = await Promise.all(
        fights.map(async (fight) => {
          const odds = await calculateFightOdds(fight.id);
          return {
            fight,
            odds,
          };
        })
      );

      return {
        eventId,
        fights: fightsWithOdds,
        totalFights: fights.length,
      };
    },
    [`event-betting-summary-${eventId}`],
    {
      tags: [`event-${eventId}`, `event-fights-${eventId}`],
      revalidate: 5, // 5秒ごとに再検証 / Revalidate every 5 seconds
    }
  )();
}

/**
 * Get betting odds for an event (deprecated, use getFightOdds instead)
 * イベントのオッズを取得（已棄用，請使用getFightOdds）
 * @deprecated Use getFightOdds(fightId) instead
 */
export async function getBettingOdds(eventId: string): Promise<BettingOdds> {
  // 向後兼容：返回第一個對戰的賠率（如果存在）
  // Backward compatibility: return odds for first fight if exists
  const firstFight = await prisma.fight.findFirst({
    where: { event_id: eventId },
    orderBy: { fight_order: "asc" },
  });

  if (firstFight) {
    return getFightOdds(firstFight.id);
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

    // 注意：winner_id、win_method、win_round、is_manual_override 已從 Event 模型中移除
    // Note: winner_id, win_method, win_round, is_manual_override have been removed from Event model
    await tx.event.update({
      where: { id: eventId },
      data: {
        status: newStatus,
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

