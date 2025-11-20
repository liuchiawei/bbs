import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { Decimal } from "decimal.js";

const placeBetSchema = z.object({
  eventId: z.string(),
  target_winner_id: z.string(),
  amount: z.number().min(10, "Minimum bet is 10"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = placeBetSchema.parse(body);

    // Transaction: Check balance, deduct points, create bet log
    const bet = await prisma.$transaction(async (tx) => {
      // 1. Get User with latest balance (lock row?)
      // Prisma doesn't support explicit locking easily without raw query,
      // but atomic update handles the deduction safely.
      // We check balance first.
      const currentUser = await tx.user.findUnique({
        where: { userId: user.userId },
      });

      if (!currentUser) throw new Error("User not found");

      const betAmount = new Decimal(validatedData.amount);

      if (new Decimal(currentUser.virtual_score).lt(betAmount)) {
        throw new Error("Insufficient funds");
      }

      // 2. Check Event Status
      const event = await tx.event.findUnique({
        where: { id: validatedData.eventId },
      });

      if (!event) throw new Error("Event not found");
      if (event.status !== "OPEN")
        throw new Error("Betting is closed for this event");

      // 3. Deduct Points
      await tx.user.update({
        where: { userId: user.userId },
        data: {
          virtual_score: { decrement: betAmount },
        },
      });

      // 4. Create Bet Log
      const newBet = await tx.bettingLog.create({
        data: {
          userId: user.userId,
          eventId: validatedData.eventId,
          bet_amount: betAmount,
          target_winner_id: validatedData.target_winner_id,
          odds_snapshot: new Decimal(0), // Pool odds are dynamic, snapshot 0 or current est.
          settlement_status: "PENDING",
        },
      });

      return newBet;
    });

    return NextResponse.json(bet, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error.message === "Insufficient funds") {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    if (error.message === "Betting is closed for this event") {
      return NextResponse.json({ error: "Betting is closed" }, { status: 400 });
    }

    console.error("Error placing bet:", error);
    return NextResponse.json({ error: "Failed to place bet" }, { status: 500 });
  }
}
