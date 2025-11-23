/**
 * Fighter Recent Fights API Route
 * 選手最近對戰 API 路由
 * Returns fighter's recent fights
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFighterBySlug } from "@/lib/services/fighters";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // 檢查是否為 UUID（ID）或 slug
    // Check if it's a UUID (ID) or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    let fighter;
    let fighterId: string;
    
    if (isUUID) {
      // 如果是 UUID，直接查詢 ID
      // If UUID, query by ID directly
      fighter = await prisma.fighter.findUnique({
        where: { id: slug },
      });
      fighterId = slug;
    } else {
      // 否則使用 slug 查詢
      // Otherwise use slug query
      fighter = await getFighterBySlug(slug);
      fighterId = fighter?.id || "";
    }

    if (!fighter) {
      return NextResponse.json({ error: "Fighter not found" }, { status: 404 });
    }

    const fights = await prisma.fight.findMany({
      where: { fighter_id: fighterId },
      include: {
        opponent: {
          select: {
            id: true,
            slug: true,
            name: true,
            thumb: true,
            cutout: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            fight_date: true,
            status: true,
          },
        },
      },
      orderBy: {
        event: {
          fight_date: "desc",
        },
      },
      take: limit,
    });

    return NextResponse.json({
      fights: fights.map((fight) => ({
        id: fight.id,
        result: fight.result,
        method: fight.method,
        round: fight.round,
        time: fight.time,
        opponent: fight.opponent
          ? {
              id: fight.opponent.id,
              name: fight.opponent.name,
              slug: fight.opponent.slug,
            }
          : null,
        event: {
          id: fight.event.id,
          name: fight.event.name,
          fight_date: fight.event.fight_date,
        },
      })),
    });
  } catch (error) {
    console.error("Error fetching recent fights:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent fights" },
      { status: 500 }
    );
  }
}

