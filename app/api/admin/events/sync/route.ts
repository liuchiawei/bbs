import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncEventsFromExternalAPI } from "@/lib/services/events";
import { revalidateTag } from "next/cache";
import type { ExternalEventSource } from "@/lib/types";

/**
 * POST /api/admin/events/sync
 * Admin-only event synchronization endpoint
 * 管理者専用のイベント同期エンドポイント
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

    const body = await request.json().catch(() => ({}));
    const source: ExternalEventSource =
      (body.source as ExternalEventSource) || "thesportsdb";

    console.log(
      `[Admin Sync] Admin ${user.userId} triggered event sync from ${source}`
    );

    // Execute synchronization with admin ID for audit logging
    // 執行同步，傳遞管理員 ID 用於審計日誌
    const result = await syncEventsFromExternalAPI(source, user.userId);

    console.log(`[Admin Sync] Synchronization completed:`, result);

    // Invalidate cache (符合 Next.js 16 規範，使用 'max' 參數)
    // キャッシュを無効化（符合 Next.js 16 規範，使用 'max' 參數）
    revalidateTag("events", "max");
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取

    return NextResponse.json({
      success: true,
      message:
        result.created + result.updated + result.merged === 0
          ? "Sync completed but no events were created, updated, or merged."
          : "Events synchronized successfully",
      result: {
        created: result.created,
        updated: result.updated,
        merged: result.merged,
        errors: result.errors,
        total: result.created + result.updated + result.merged,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error syncing events:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync events",
      },
      { status: 500 }
    );
  }
}

