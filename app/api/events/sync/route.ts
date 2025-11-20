/**
 * Events Sync API Route
 * イベント同期APIルート
 * Handles synchronization of events from external APIs
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { syncEventsFromExternalAPI } from "@/lib/services/events";
import type { ExternalEventSource } from "@/lib/types";

/**
 * POST /api/events/sync
 * Trigger event synchronization from external API
 * 外部APIからイベント同期をトリガー
 */
export async function POST(request: NextRequest) {
  try {
    // Secret認証（Cron Jobからのリクエストを保護）
    // Secret authentication (protect requests from Cron Jobs)
    const providedSecret = process.env.EVENTS_SYNC_SECRET;
    
    // Vercel Cron Jobs は特定のヘッダーを送信する
    // Vercel Cron Jobs sends specific headers
    const cronHeader = request.headers.get("x-vercel-cron");
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    
    // リクエストボディを一度だけ読み取る
    // Read request body only once
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // ボディが空の場合は空オブジェクトを使用
      // Use empty object if body is empty
    }

    const bodySecret = body.secret || null;

    // secret が設定されている場合、認証を要求
    // If secret is set, require authentication
    // Vercel Cron からのリクエストか、正しい secret を持つリクエストのみ許可
    // Allow only requests from Vercel Cron or with correct secret
    if (providedSecret) {
      const isVercelCron = cronHeader === "1";
      const isValidRequest =
        isVercelCron || secret === providedSecret || bodySecret === providedSecret;
      
      if (!isValidRequest) {
        return NextResponse.json(
          { error: "Invalid secret token" },
          { status: 401 }
        );
      }
    }

    // リクエストボディからソースを取得（デフォルト: thesportsdb）
    // Get source from request body (default: thesportsdb)
    const source: ExternalEventSource =
      (body.source as ExternalEventSource) || "thesportsdb";

    // V1 API: API key はオプション（デフォルトで無料キー "123" を使用）
    // V1 API: API key is optional (uses free key "123" by default)
    const apiKey = process.env.THESPORTSDB_API_KEY || "123";

    console.log(`[Sync] Starting event synchronization from ${source} (V1 API)`);
    console.log(`[Sync] API Key used: ${apiKey} (${process.env.THESPORTSDB_API_KEY ? "from env" : "default free key"})`);

    // 同期を実行
    // Execute synchronization
    const result = await syncEventsFromExternalAPI(source);

    console.log(`[Sync] Synchronization completed:`, result);
    
    // 診斷資訊を追加
    // Add diagnostic information
    const diagnosticInfo: any = {
      apiKey: apiKey.substring(0, 3) + "***", // 部分隱藏 API key
      source,
    };

    // キャッシュを無効化して最新データを取得できるようにする
    // Invalidate cache to fetch latest data
    revalidateTag("events");

    return NextResponse.json({
      success: true,
      message: result.created + result.updated === 0 
        ? "Sync completed but no events were created or updated. Check server logs for details."
        : "Events synchronized successfully",
      result: {
        created: result.created,
        updated: result.updated,
        errors: result.errors,
        total: result.created + result.updated,
      },
      diagnostic: diagnosticInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error syncing events:", error);

    // エラーを返すが、既存のデータには影響しない
    // Return error but don't affect existing data
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to sync events",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events/sync
 * Get sync status (for monitoring)
 * 同期ステータスを取得（監視用）
 */
export async function GET() {
  return NextResponse.json({
    message: "Events sync endpoint",
    usage: "POST /api/events/sync?secret=YOUR_SECRET",
    note: "This endpoint syncs events from external APIs (TheSportsDB)",
  });
}

