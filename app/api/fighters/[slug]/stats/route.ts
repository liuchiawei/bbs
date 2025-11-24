/**
 * Fighter Statistics API Route
 * 選手統計 API 路由
 * Returns fighter win/loss/draw statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFighterBySlug } from "@/lib/services/fighters";
import type { FighterWithEvents } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 檢查是否為 UUID（ID）或 slug
    // Check if it's a UUID (ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let fighter: FighterWithEvents | null = null;
    let fighterId: string;
    
    if (isUUID) {
      // 如果是 UUID，直接查詢 ID
      // If UUID, query by ID directly
      const fighterRecord = await prisma.fighter.findUnique({
        where: { id: slug },
        select: { id: true },
      });
      if (!fighterRecord) {
        return NextResponse.json({ error: "Fighter not found" }, { status: 404 });
      }
      fighterId = slug;
    } else {
      // 否則使用 slug 查詢
      // Otherwise use slug query
      fighter = await getFighterBySlug(slug);
      if (!fighter) {
        return NextResponse.json({ error: "Fighter not found" }, { status: 404 });
      }
      // Type assertion needed due to PrismaToApp type transformation
      // 由於 PrismaToApp 類型轉換，需要類型斷言
      fighterId = (fighter as FighterWithEvents & { id: string }).id;
    }

    // 計算選手統計
    // Calculate fighter statistics
    const fights = await prisma.fight.findMany({
      where: { fighter_id: fighterId },
      select: { result: true },
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;

    fights.forEach((fight) => {
      if (!fight.result) return;
      const result = fight.result.toLowerCase();
      if (result.includes("win")) {
        wins++;
      } else if (result.includes("loss")) {
        losses++;
      } else if (result.includes("draw") || result === "nc") {
        draws++;
      }
    });

    return NextResponse.json({
      wins,
      losses,
      draws,
      total: fights.length,
    });
  } catch (error) {
    console.error("Error fetching fighter stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch fighter stats" },
      { status: 500 }
    );
  }
}

