import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculatePoolOdds, settleEvent } from "@/lib/betting-system";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";

const updateEventSchema = z.object({
  status: z
    .enum(["PENDING", "OPEN", "CLOSED", "SETTLED", "CANCELLED"])
    .optional(),
  winner_id: z.string().optional(), // 用於結算邏輯，不是 Event 模型的欄位 / For settlement logic, not an Event model field
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bets: true, posts: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Calculate current odds
    const poolData = await calculatePoolOdds(id);

    return NextResponse.json({
      ...event,
      poolData,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Check if we are settling the event
    if (validatedData.status === "SETTLED" && validatedData.winner_id) {
      // Get IP address
      // IPアドレスを取得
      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const ipAddress = getClientIpAddress(forwardedFor, realIp);

      const result = await settleEvent(
        id,
        validatedData.winner_id,
        user.userId,
        ipAddress
      );

      // Update cache after settlement (符合 Next.js 16 規範，使用 'max' 參數)
      // 決済後にキャッシュを更新（符合 Next.js 16 規範，使用 'max' 參數）
      revalidateTag(`event-${id}`, "max");
      revalidateTag(`event-odds-${id}`, "max");
      revalidateTag(`event-fights-${id}`, "max");
      revalidateTag("events", "max");
      revalidateTag("admin-events", "max"); // 更新管理員賽事列表快取
      revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取
      revalidatePath(`/event/${id}`);

      return NextResponse.json(result);
    }

    // Normal update
    // 注意：winner_id 不是 Event 模型的欄位，只用於結算邏輯
    // Note: winner_id is not an Event model field, only used for settlement logic
    const updateData: any = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    // Audit log for normal update
    // IPアドレスを取得
    // Get IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    await prisma.auditLog.create({
      data: {
        adminId: user.userId,
        action_type: "UPDATE_EVENT",
        description: `Updated event ${id}. Status: ${validatedData.status}`,
        ip_address: ipAddress,
      },
    });

    // Update cache (符合 Next.js 16 規範，使用 'max' 參數)
    // 更新快取（符合 Next.js 16 規範，使用 'max' 參數）
    revalidateTag(`event-${id}`, "max");
    revalidateTag(`event-fights-${id}`, "max");
    revalidateTag("events", "max");
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取
    revalidateTag("admin-events", "max"); // 更新管理員賽事列表快取
    revalidatePath(`/event/${id}`);

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
