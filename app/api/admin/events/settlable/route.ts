/**
 * Admin Settlable Events API Route
 * 管理員可結算賽事API路由
 * Optimized endpoint for admin event settlement page
 * 為管理員結算頁面優化的端點
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// API ルートを動的レンダリングに強制（prerenderを無効化）
// Force API route to dynamic rendering (disable prerender)
// Note: このルートは getCurrentUser() 内で cookies() を使用するため、自動的に動的になります
// Note: This route automatically becomes dynamic because getCurrentUser() uses cookies() internally

/**
 * GET /api/admin/events/settlable
 * Get events that can be settled (OPEN or CLOSED status) with main fight info
 * 獲取可結算的賽事（OPEN 或 CLOSED 狀態）及主賽信息
 * 
 * Returns: Array of events with main fight information
 * 返回：包含主賽信息的賽事數組
 * 
 * Optimized for admin settlement page:
 * - Only returns OPEN or CLOSED events
 * - Only includes main fight (first fight) information
 * - Uses caching to reduce database load
 * - Minimal data transfer
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // 使用快取優化性能（符合 Next.js 16 規範）
    // Use cache for performance optimization (following Next.js 16 standards)
    const events = await unstable_cache(
      async () => {
        const eventsData = await prisma.event.findMany({
          where: {
            status: {
              in: ["OPEN", "CLOSED"],
            },
          },
          orderBy: {
            fight_date: "desc", // 最新的在前
          },
          select: {
            id: true,
            name: true,
            fight_date: true,
            status: true,
            fights: {
              where: {
                fight_order: 1, // 只獲取第一個對戰（主賽）
              },
              take: 1, // 只取一個
              orderBy: {
                fight_order: "asc", // 確保順序
              },
              select: {
                id: true,
                fighter_id: true,
                opponent_id: true,
                fighter: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                opponent: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        // 轉換為優化的數據結構
        // Transform to optimized data structure
        return eventsData.map((event) => ({
          id: event.id,
          name: event.name,
          fight_date: event.fight_date.toISOString(),
          status: event.status as "OPEN" | "CLOSED",
          mainFight: event.fights[0]
            ? {
                id: event.fights[0].id,
                fighter_id: event.fights[0].fighter_id,
                opponent_id: event.fights[0].opponent_id,
                fighter: event.fights[0].fighter,
                opponent: event.fights[0].opponent,
              }
            : null,
        }));
      },
      ["admin-settlable-events"],
      {
        tags: ["admin-settlable-events", "events"],
        revalidate: 30, // 30秒重新驗證（管理員操作頻率較低）
      }
    )();

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching settlable events:", error);
    return NextResponse.json(
      { error: "Failed to fetch settlable events" },
      { status: 500 }
    );
  }
}

