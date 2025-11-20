/**
 * Test UFC API Endpoint
 * UFC API 測試端點
 * Test endpoint to see raw API response from TheSportsDB V1
 */

import { NextRequest, NextResponse } from "next/server";
import { TheSportsDBClient } from "@/lib/adapters/thesportsdb";

/**
 * GET /api/events/test-ufc-api
 * Test UFC next events API and return raw response
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.THESPORTSDB_API_KEY || "123";
    const client = new TheSportsDBClient({ apiKey });

    console.log(`[Test UFC API] Using API key: ${apiKey}`);
    console.log(`[Test UFC API] Testing UFC league ID: 4443`);

    // Test 1: Direct API call to see raw response
    // 測試1: 直接 API 調用以查看原始回應
    const testUrl = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=4443`;
    console.log(`[Test UFC API] Request URL: ${testUrl}`);

    const rawResponse = await fetch(testUrl);
    const rawResponseText = await rawResponse.text();
    let rawData: any = null;

    try {
      rawData = JSON.parse(rawResponseText);
    } catch (e) {
      console.error("[Test UFC API] Failed to parse JSON:", e);
    }

    // Test 2: Use client method
    // 測試2: 使用客戶端方法
    let clientEvents: any[] = [];
    let clientError: string | null = null;

    try {
      clientEvents = await client.getNextEventsByLeague("4443");
      console.log(
        `[Test UFC API] Client method returned ${clientEvents.length} events`
      );
    } catch (error) {
      clientError = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Test UFC API] Client method failed:`, error);
    }

    // Test 3: Check database
    // 測試3: 檢查資料庫
    const { prisma } = await import("@/lib/db");
    const dbEvents = await prisma.event.findMany({
      where: {
        sport_type: "ufc",
      },
      orderBy: {
        fight_date: "asc",
      },
      take: 10,
    });

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        apiKey: apiKey,
        tests: {
          rawApi: {
            url: testUrl,
            status: rawResponse.status,
            statusText: rawResponse.statusText,
            headers: Object.fromEntries(rawResponse.headers.entries()),
            responseText: rawResponseText.substring(0, 1000), // First 1000 chars
            parsedData: rawData,
            eventsCount: rawData?.events?.length || 0,
            firstEvent: rawData?.events?.[0] || null,
          },
          clientMethod: {
            success: !clientError,
            error: clientError,
            eventsCount: clientEvents.length,
            events: clientEvents.slice(0, 3), // First 3 events
          },
          database: {
            eventsCount: dbEvents.length,
            events: dbEvents.map((e) => ({
              id: e.id,
              name: e.name,
              fight_date: e.fight_date,
              sport_type: e.sport_type,
              external_id: e.external_id,
              external_source: e.external_source,
            })),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Test UFC API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
