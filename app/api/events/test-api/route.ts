/**
 * Test TheSportsDB API Connection
 * TheSportsDB API接続をテスト
 * Test endpoint to verify API key and connection
 */

import { NextRequest, NextResponse } from "next/server";
import { TheSportsDBClient } from "@/lib/adapters/thesportsdb";

/**
 * GET /api/events/test-api
 * Test TheSportsDB API connection
 */
export async function GET(request: NextRequest) {
  try {
    // V1 API: API key はオプション（デフォルトで無料キー "123" を使用）
    // V1 API: API key is optional (uses free key "123" by default)
    const apiKey = process.env.THESPORTSDB_API_KEY || "123";
    
    const client = new TheSportsDBClient({ apiKey });

    // テスト: リーグベースの取得
    // Test: League-based fetching
    const testLeagues = [
      { id: "4443", name: "UFC" },
      { id: "4445", name: "Boxing" },
    ];

    const testResults = await Promise.all(
      testLeagues.map(async (league) => {
        let events: any[] = [];
        let error: string | null = null;

        try {
          events = await client.getNextEventsByLeague(league.id);
          console.log(`[Test] Successfully fetched ${events.length} events from ${league.name} (ID: ${league.id})`);
        } catch (err) {
          error = err instanceof Error ? err.message : "Unknown error";
          console.error(`[Test] Failed to fetch events for ${league.name}:`, err);
        }

        return {
          league: league.name,
          leagueId: league.id,
          method: `eventsnextleague.php?id=${league.id}`,
          success: !error,
          error,
          eventsFound: events.length,
          sampleEvents: events.slice(0, 3),
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "API connection test completed (V1 API)",
      apiKeyUsed: apiKey,
      apiKeySource: process.env.THESPORTSDB_API_KEY ? "environment" : "default (free key '123')",
      tests: testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Test] API connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

