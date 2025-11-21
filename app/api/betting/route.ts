import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { placeBetSchema } from "@/lib/validations";
import { placeBet } from "@/lib/services/betting";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = placeBetSchema.parse(body);

    // Get IP address
    // IPアドレスを取得
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // Place bet using service layer
    // サービス層を使用してベットを配置
    const bet = await placeBet(
      user.userId,
      validatedData.eventId,
      validatedData.target_winner_id,
      validatedData.amount,
      ipAddress
    );

    // Update cache after bet placement
    // ベット配置後にキャッシュを更新
    revalidateTag(`event-${validatedData.eventId}`, "max");
    revalidateTag(`event-odds-${validatedData.eventId}`, "max");
    revalidateTag("events", "max");
    revalidatePath(`/events/${validatedData.eventId}`);

    return NextResponse.json(bet, { status: 201 });
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

    if (error.message === "Insufficient funds") {
      return NextResponse.json(
        {
          error: "Insufficient funds",
          message:
            "You don't have enough points. Post more content and interact with others to earn more points!",
        },
        { status: 400 }
      );
    }

    if (error.message === "Betting is closed for this event") {
      return NextResponse.json(
        { error: "Betting is closed for this event" },
        { status: 400 }
      );
    }

    if (error.message === "User not found") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (error.message === "Event not found") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    console.error("Error placing bet:", error);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
