/**
 * Fighters API Route
 * 選手API路由
 * Handles fetching fighters list
 * 處理獲取選手列表
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/fighters?sport_type=xxx
 * Get all fighters (optionally filtered by sport type)
 * 獲取所有選手（可選按運動類型過濾）
 * 
 * Query params:
 * - sport_type: Optional sport type filter (boxing, ufc, mma, etc.)
 * 
 * Returns: Array of Fighter
 * 返回：Fighter陣列
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportType = searchParams.get("sport_type");

    const whereClause: any = {};
    if (sportType) {
      whereClause.sport_type = sportType;
    }

    const fighters = await prisma.fighter.findMany({
      where: whereClause,
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sport_type: true,
      },
    });

    return NextResponse.json(fighters);
  } catch (error) {
    console.error("Error fetching fighters:", error);
    return NextResponse.json(
      { error: "Failed to fetch fighters" },
      { status: 500 }
    );
  }
}

