/**
 * Fight Odds API Route
 * 對戰賠率API路由
 * Get betting odds for a specific fight
 * 獲取特定對戰的投注賠率
 */

import { NextRequest, NextResponse } from "next/server";
import { getFightOdds } from "@/lib/services/betting";

/**
 * GET /api/fights/[id]/odds
 * Get betting odds for a fight
 * 獲取對戰的投注賠率
 * 
 * Returns: BettingOdds with totalPool, netPool, odds, betsByOutcome
 * 返回：BettingOdds，包含總池、淨池、賠率、各選項投注額
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const odds = await getFightOdds(id);

    return NextResponse.json(odds);
  } catch (error) {
    console.error("Error fetching fight odds:", error);
    return NextResponse.json(
      { error: "Failed to fetch fight odds" },
      { status: 500 }
    );
  }
}

