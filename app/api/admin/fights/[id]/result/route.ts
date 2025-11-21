/**
 * Admin Fight Result API Route
 * 管理員對戰結果API路由
 * Update fight result and trigger settlement
 * 更新對戰結果並觸發結算
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { settleFightSchema } from "@/lib/validations";
import { settleFight } from "@/lib/betting-system";
import { getClientIpAddress } from "@/lib/services/audit";
import { revalidateTag } from "next/cache";

/**
 * POST /api/admin/fights/[id]/result
 * Update fight result and settle bets
 * 更新對戰結果並結算投注
 * 
 * Body:
 * {
 *   winnerId: string;
 *   winMethod?: string;
 *   winRound?: number;
 * }
 */
export async function POST(
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
    const validatedData = settleFightSchema.parse(body);

    // Get IP address
    // 獲取IP地址
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // Settle fight
    // 結算對戰
    const result = await settleFight(
      id,
      validatedData.winnerId,
      user.userId,
      ipAddress,
      validatedData.winMethod,
      validatedData.winRound
    );

    // Update cache (符合 Next.js 16 規範，使用 'max' 參數)
    // 更新快取（符合 Next.js 16 規範，使用 'max' 參數）
    revalidateTag(`event-${result.fight.event.id}`, "max");
    revalidateTag(`event-fights-${result.fight.event.id}`, "max");
    revalidateTag(`fight-odds-${id}`, "max");
    revalidateTag("events", "max");
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Fight not found") {
      return NextResponse.json({ error: "Fight not found" }, { status: 404 });
    }

    if (error.message === "Winner ID must be one of the fight fighters") {
      return NextResponse.json(
        { error: "Winner ID must be one of the fight fighters" },
        { status: 400 }
      );
    }

    if (error.message === "Cannot settle a cancelled fight") {
      return NextResponse.json(
        { error: "Cannot settle a cancelled fight" },
        { status: 400 }
      );
    }

    console.error("Error settling fight:", error);
    return NextResponse.json(
      { error: "Failed to settle fight" },
      { status: 500 }
    );
  }
}

