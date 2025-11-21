import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { settleEventSchema } from "@/lib/validations";
import { settleEvent } from "@/lib/betting-system";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * POST /api/admin/events/[id]/result
 * Settle an event with result
 * イベントを結果とともに決済
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
    const body = await request.json();
    const validatedData = settleEventSchema.parse(body);

    // Get IP address
    // IPアドレスを取得
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // Settle event
    // イベントを決済
    const result = await settleEvent(
      eventId,
      validatedData.winnerId,
      user.userId,
      ipAddress,
      validatedData.winMethod,
      validatedData.winRound
    );

    // Update cache after settlement
    // 決済後にキャッシュを更新
    revalidateTag(`event-${eventId}`, "max");
    revalidateTag(`event-odds-${eventId}`, "max");
    revalidateTag("events", "max");
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json({
      message: "Event settled successfully",
      result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (
      error.message === "Event not found" ||
      error.message === "Event cannot be settled" ||
      error.message === "Winner ID must be one of the event fighters"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error.message.includes("Settlement verification failed")) {
      return NextResponse.json(
        {
          error: "Settlement verification failed",
          message: error.message,
        },
        { status: 500 }
      );
    }

    console.error("Error settling event:", error);
    return NextResponse.json(
      { error: "Failed to settle event" },
      { status: 500 }
    );
  }
}

