import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rollbackBet } from "@/lib/services/betting";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * POST /api/admin/betting/[betId]/rollback
 * Rollback a single bet
 * 単一のベットをロールバック
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ betId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { betId } = await params;

    // Get IP address
    // IPアドレスを取得
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // Rollback bet
    // ベットをロールバック
    const bet = await rollbackBet(betId, user.userId, ipAddress);

    // Update cache after rollback
    // ロールバック後にキャッシュを更新
    revalidateTag(`event-${bet.eventId}`, "max");
    revalidateTag(`event-odds-${bet.eventId}`, "max");
    revalidateTag("events", "max");
    revalidatePath(`/event/${bet.eventId}`);

    return NextResponse.json({
      message: "Bet rolled back successfully",
      bet,
    });
  } catch (error: any) {
    if (
      error.message === "Bet not found" ||
      error.message === "Bet has already been settled"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error rolling back bet:", error);
    return NextResponse.json(
      { error: "Failed to rollback bet" },
      { status: 500 }
    );
  }
}

