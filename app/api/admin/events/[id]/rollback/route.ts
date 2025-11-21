import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rollbackEvent } from "@/lib/services/betting";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * POST /api/admin/events/[id]/rollback
 * Rollback all bets for an event
 * イベントのすべてのベットをロールバック
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;

    // Get IP address
    // IPアドレスを取得
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // Rollback event
    // イベントをロールバック
    const result = await rollbackEvent(eventId, user.userId, ipAddress);

    // Update cache after rollback
    // ロールバック後にキャッシュを更新
    revalidateTag(`event-${eventId}`, "max");
    revalidateTag(`event-odds-${eventId}`, "max");
    revalidateTag("events", "max");
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json({
      message: "Event rolled back successfully",
      result,
    });
  } catch (error: any) {
    if (
      error.message === "Event not found" ||
      error.message === "Event cannot be rolled back"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Error rolling back event:", error);
    return NextResponse.json(
      { error: "Failed to rollback event" },
      { status: 500 }
    );
  }
}

