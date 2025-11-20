import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema for creating an event
const createEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  fight_date: z.string().transform((str) => new Date(str)),
  status: z.enum(["PENDING", "OPEN", "CLOSED", "SETTLED", "CANCELLED"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: {
        fight_date: "asc",
      },
      include: {
        _count: {
          select: { bets: true, posts: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Create event and audit log in a transaction
    const event = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          name: validatedData.name,
          fight_date: validatedData.fight_date,
          status: validatedData.status || "PENDING",
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: user.userId,
          action_type: "CREATE_EVENT",
          description: `Created event: ${newEvent.name} (ID: ${newEvent.id})`,
        },
      });

      return newEvent;
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
