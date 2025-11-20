import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculatePoolOdds, settleEvent } from "@/lib/betting-system";
import { z } from "zod";

const updateEventSchema = z.object({
  status: z.enum(["PENDING", "OPEN", "CLOSED", "SETTLED", "CANCELLED"]).optional(),
  winner_id: z.string().optional(),
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
      const result = await settleEvent(id, validatedData.winner_id, user.userId);
      return NextResponse.json(result);
    }

    // Normal update
    const event = await prisma.event.update({
      where: { id },
      data: {
        status: validatedData.status,
        winner_id: validatedData.winner_id,
      },
    });

    // Audit log for normal update
    await prisma.auditLog.create({
      data: {
        adminId: user.userId,
        action_type: "UPDATE_EVENT",
        description: `Updated event ${id}. Status: ${validatedData.status}`,
      },
    });

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
