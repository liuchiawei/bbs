/**
 * Fight API Route (Single Fight)
 * 單一對戰API路由
 * Handles operations for a single fight
 * 處理單一對戰的操作
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { settleFightSchema } from "@/lib/validations";
import { settleFight } from "@/lib/betting-system";
import { updateFightResult } from "@/lib/services/fighter-events";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag } from "next/cache";

/**
 * GET /api/fights/[id]
 * Get single fight details with betting odds
 * 獲取單一對戰詳情（包含投注賠率）
 * 
 * Returns: Fight with fighter, opponent, event, and betting odds
 * 返回：Fight，包含選手、對手、賽事和投注賠率
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fight = await prisma.fight.findUnique({
      where: { id },
      include: {
        fighter: true,
        opponent: true,
        event: true,
        _count: {
          select: {
            bets: true,
          },
        },
      },
    });

    if (!fight) {
      return NextResponse.json({ error: "Fight not found" }, { status: 404 });
    }

    // 計算投注賠率（如果可投注）
    // Calculate betting odds (if bettable)
    let odds = null;
    if (fight.is_bettable && fight.status !== "COMPLETED") {
      const { calculateFightOdds } = await import("@/lib/betting-system");
      odds = await calculateFightOdds(id);
    }

    return NextResponse.json({
      ...fight,
      odds,
    });
  } catch (error) {
    console.error("Error fetching fight:", error);
    return NextResponse.json(
      { error: "Failed to fetch fight" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/fights/[id]
 * Update fight information or result (Admin only)
 * 更新對戰資訊或結果（僅管理員）
 * 
 * Body:
 * - result?: string (Win/Loss/Draw/NC)
 * - method?: string
 * - round?: number
 * - time?: string
 * - fightType?: "MAIN" | "CO_MAIN" | "PRELIMS" | "EARLY_PRELIMS"
 * - fightOrder?: number
 * - weightClass?: string
 * - isBettable?: boolean
 * - status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
 */
export async function PATCH(
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

    const { id } = await params;
    const body = await request.json();

    // 驗證輸入
    // Validate input
    const schema = z.object({
      result: z.string().optional(),
      method: z.string().optional().nullable(),
      round: z.number().int().positive().optional().nullable(),
      time: z.string().optional().nullable(),
      fightType: z.enum(["MAIN", "CO_MAIN", "PRELIMS", "EARLY_PRELIMS"]).optional(),
      fightOrder: z.number().int().positive().optional(),
      weightClass: z.string().optional().nullable(),
      isBettable: z.boolean().optional(),
      status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
    });

    const validatedData = schema.parse(body);

    // 更新對戰
    // Update fight
    const updatedFight = await prisma.fight.update({
      where: { id },
      data: {
        result: validatedData.result,
        method: validatedData.method,
        round: validatedData.round,
        time: validatedData.time,
        fight_type: validatedData.fightType,
        fight_order: validatedData.fightOrder,
        weight_class: validatedData.weightClass,
        is_bettable: validatedData.isBettable,
        status: validatedData.status,
      },
      include: {
        fighter: true,
        opponent: true,
        event: true,
      },
    });

    // 更新快取（符合 Next.js 16 規範，使用 'max' 參數）
    // Update cache (符合 Next.js 16 規範，使用 'max' 參數)
    revalidateTag(`event-${updatedFight.event_id}`, "max");
    revalidateTag(`event-fights-${updatedFight.event_id}`, "max");
    revalidateTag(`fight-odds-${id}`, "max");
    revalidateTag("events", "max");
    revalidateTag("admin-events", "max"); // 更新管理員賽事列表快取
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取
    // 失效相關選手的快取（確保雙向查詢結果正確更新）
    // Invalidate related fighters' cache (ensure bidirectional query results are correctly updated)
    revalidateTag(`fighter-${updatedFight.fighter_id}`, "max");
    if (updatedFight.opponent_id) {
      revalidateTag(`fighter-${updatedFight.opponent_id}`, "max");
      revalidateTag(`fighter-fights-${updatedFight.opponent_id}`, "max");
    }
    revalidateTag(`fighter-fights-${updatedFight.fighter_id}`, "max");
    revalidateTag("fighters", "max");

    return NextResponse.json(updatedFight);
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

    console.error("Error updating fight:", error);
    return NextResponse.json(
      { error: "Failed to update fight" },
      { status: 500 }
    );
  }
}

