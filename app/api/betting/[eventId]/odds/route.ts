import { NextRequest, NextResponse } from "next/server";
import { getBettingOdds } from "@/lib/services/betting";

/**
 * GET /api/betting/[eventId]/odds
 * Get betting odds for an event
 * イベントのオッズを取得
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

    const odds = await getBettingOdds(eventId);

    return NextResponse.json(odds);
  } catch (error) {
    console.error("Error getting betting odds:", error);
    return NextResponse.json(
      { error: "Failed to get betting odds" },
      { status: 500 }
    );
  }
}

