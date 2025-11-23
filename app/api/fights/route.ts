/**
 * Fights API Route
 * 對戰API路由
 * Handles CRUD operations for fights
 * 處理對戰的CRUD操作
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getFightsByEvent } from "@/lib/services/fighter-events";
import { revalidateTag } from "next/cache";

/**
 * GET /api/fights?eventId=xxx
 * Get all fights for an event
 * 獲取賽事的所有對戰
 * 
 * Query params:
 * - eventId: Event ID (required)
 * 
 * Returns: Array of Fight with fighter, opponent, and betting stats
 * 返回：Fight陣列，包含選手、對手和投注統計
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId query parameter is required" },
        { status: 400 }
      );
    }

    // 獲取賽事的所有對戰（按順序）
    // Get all fights for the event (ordered)
    const fights = await getFightsByEvent(eventId);

    return NextResponse.json(fights);
  } catch (error) {
    console.error("Error fetching fights:", error);
    return NextResponse.json(
      { error: "Failed to fetch fights" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fights
 * Create a new fight (Admin only)
 * 創建新對戰（僅管理員）
 * 
 * Body:
 * {
 *   eventId: string;
 *   fighterId: string;
 *   opponentId: string;
 *   fightType: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS";
 *   fightOrder: number;
 *   weightClass?: string;
 *   isBettable?: boolean;
 * }
 */
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

    // 驗證輸入
    // Validate input
    const schema = z.object({
      eventId: z.string().min(1),
      fighterId: z.string().min(1),
      opponentId: z.string().min(1),
      fightType: z.enum(["MAIN", "CO_MAIN", "PRELIMS", "EARLY_PRELIMS"]),
      fightOrder: z.number().int().positive(),
      weightClass: z.string().optional(),
      isBettable: z.boolean().optional(),
    });

    const validatedData = schema.parse(body);

    // 驗證賽事存在
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: validatedData.eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 驗證選手存在
    // Verify fighters exist
    const [fighter, opponent] = await Promise.all([
      prisma.fighter.findUnique({ where: { id: validatedData.fighterId } }),
      prisma.fighter.findUnique({ where: { id: validatedData.opponentId } }),
    ]);

    if (!fighter || !opponent) {
      return NextResponse.json(
        { error: "Fighter not found" },
        { status: 404 }
      );
    }

    // 檢查對戰順序是否已存在
    // Check if fight order already exists
    const existingFight = await prisma.fight.findFirst({
      where: {
        event_id: validatedData.eventId,
        fight_order: validatedData.fightOrder,
      },
    });

    if (existingFight) {
      return NextResponse.json(
        { error: `Fight order ${validatedData.fightOrder} already exists for this event` },
        { status: 400 }
      );
    }

    // 創建對戰（Transaction）
    // Create fight (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 創建fighter1的Fight
      // Create Fight for fighter1
      const fighter1Fight = await tx.fight.create({
        data: {
          event_id: validatedData.eventId,
          fighter_id: validatedData.fighterId,
          opponent_id: validatedData.opponentId,
          fight_type: validatedData.fightType,
          fight_order: validatedData.fightOrder,
          weight_class: validatedData.weightClass || null,
          is_bettable: validatedData.isBettable !== false,
          status: "CONFIRMED",
        },
      });

      // 創建fighter2的Fight（使用相同的對戰順序）
      // Create Fight for fighter2 (using same fight order)
      const fighter2Fight = await tx.fight.create({
        data: {
          event_id: validatedData.eventId,
          fighter_id: validatedData.opponentId,
          opponent_id: validatedData.fighterId,
          fight_type: validatedData.fightType,
          fight_order: validatedData.fightOrder,
          weight_class: validatedData.weightClass || null,
          is_bettable: validatedData.isBettable !== false,
          status: "CONFIRMED",
        },
      });

      return { fighter1Fight, fighter2Fight };
    });

    // 更新快取（符合 Next.js 16 規範，使用 'max' 參數）
    // Update cache (符合 Next.js 16 規範，使用 'max' 參數)
    revalidateTag(`event-${validatedData.eventId}`, "max");
    revalidateTag(`event-fights-${validatedData.eventId}`, "max");
    revalidateTag("events", "max");
    revalidateTag("admin-events", "max"); // 更新管理員賽事列表快取
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    console.error("Error creating fight:", error);
    return NextResponse.json(
      { error: "Failed to create fight" },
      { status: 500 }
    );
  }
}

