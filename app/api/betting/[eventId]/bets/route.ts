import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/betting/[eventId]/bets
 * Get all bets for an event
 * イベントのすべてのベットを取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const bets = await prisma.bettingLog.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimal to number for JSON serialization
    // Decimalを数値に変換してJSONシリアル化
    const serializedBets = bets.map((bet) => ({
      ...bet,
      bet_amount: Number(bet.bet_amount),
      odds_snapshot: Number(bet.odds_snapshot),
      final_payout: bet.final_payout ? Number(bet.final_payout) : null,
    }));

    return NextResponse.json(serializedBets);
  } catch (error) {
    console.error("Error getting bets:", error);
    return NextResponse.json(
      { error: "Failed to get bets" },
      { status: 500 }
    );
  }
}

