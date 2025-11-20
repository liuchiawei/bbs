/**
 * TheSportsDB API v1 Adapter
 * 外部APIデータを統一フォーマットに変換する適配器
 * Adapter to transform external API data into unified format
 *
 * V1 API は無料で使用可能で、API key を URL に含める必要があります
 * V1 API is free to use and requires API key in the URL
 */

import { z } from "zod";

// TheSportsDB API v1 レスポンススキーマ（実際のAPI構造に基づく）
// TheSportsDB API v1 response schema (based on actual API structure)
const TheSportsDBEventSchema = z.object({
  idEvent: z.string(),
  idAPIfootball: z.string().nullable().optional(),
  strEvent: z.string(),
  strEventAlternate: z.string().nullable().optional(),
  strFilename: z.string().nullable().optional(),
  strSport: z.string(), // "Fighting"
  idLeague: z.string().nullable().optional(), // "4443"
  strLeague: z.string().nullable().optional(), // "UFC"
  strLeagueBadge: z.string().nullable().optional(),
  strSeason: z.string().nullable().optional(), // "2025"
  strDescriptionEN: z.string().nullable().optional(),
  strHomeTeam: z.string().nullable().optional(),
  strAwayTeam: z.string().nullable().optional(),
  intHomeScore: z.string().nullable().optional(),
  intRound: z.string().nullable().optional(),
  intAwayScore: z.string().nullable().optional(),
  intSpectators: z.string().nullable().optional(),
  strOfficial: z.string().nullable().optional(),
  strTimestamp: z.string().nullable().optional(), // "2025-11-22T00:00:00"
  dateEvent: z.string(), // "2025-11-22"
  dateEventLocal: z.string().nullable().optional(),
  strTime: z.string().nullable().optional(), // "00:00:00"
  strTimeLocal: z.string().nullable().optional(),
  strGroup: z.string().nullable().optional(),
  idHomeTeam: z.string().nullable().optional(),
  strHomeTeamBadge: z.string().nullable().optional(),
  idAwayTeam: z.string().nullable().optional(),
  strAwayTeamBadge: z.string().nullable().optional(),
  intScore: z.string().nullable().optional(),
  intScoreVotes: z.string().nullable().optional(),
  strResult: z.string().nullable().optional(), // 對戰卡資訊 / Fight card information
  idVenue: z.string().nullable().optional(),
  strVenue: z.string().nullable().optional(), // "Ali Bin Hamad al-Attiyah Arena"
  strCountry: z.string().nullable().optional(), // "Qatar"
  strCity: z.string().nullable().optional(), // "Doha"
  strPoster: z.string().nullable().optional(),
  strSquare: z.string().nullable().optional(),
  strFanart: z.string().nullable().optional(),
  strThumb: z.string().nullable().optional(), // 縮圖 / Thumbnail
  strBanner: z.string().nullable().optional(),
  strMap: z.string().nullable().optional(),
  strTweet1: z.string().nullable().optional(),
  strTweet2: z.string().nullable().optional(),
  strTweet3: z.string().nullable().optional(),
  strVideo: z.string().nullable().optional(),
  strStatus: z.string().nullable().optional(), // "Not Started"
  strPostponed: z.string().nullable().optional(), // "no"
  strLocked: z.string().nullable().optional(), // "unlocked"
});

const TheSportsDBResponseSchema = z.object({
  events: z.array(TheSportsDBEventSchema).optional(),
  event: TheSportsDBEventSchema.optional(),
  // エラーレスポンスの可能性
  // Possible error response
  message: z.string().optional(),
  error: z.string().optional(),
});

// 統一されたイベントデータフォーマット
// Unified event data format
export interface UnifiedEventData {
  external_id: string;
  name: string;
  fight_date: Date;
  sport_type: "boxing" | "ufc" | "mma" | "other";
  external_data: Record<string, unknown>;
  // オプションフィールド / Optional fields
  home_team?: string;
  away_team?: string;
  venue?: string;
  league?: string;
  country?: string;
  city?: string;
  status?: string;
}

// TheSportsDB API クライアント設定
// TheSportsDB API client configuration
export interface TheSportsDBConfig {
  apiKey?: string; // V1 API: 無料キーは "1" または "123" / Free key is "1" or "123"
  baseUrl?: string;
  timeout?: number;
}

/**
 * TheSportsDB API v1 クライアント
 * TheSportsDB API v1 client
 *
 * V1 API の特徴:
 * - API key は URL に含める（header ではない）
 * - 無料 API key: "1" または "123"
 * - 基礎 URL: https://www.thesportsdb.com/api/v1/json
 *
 * V1 API features:
 * - API key is included in URL (not in header)
 * - Free API key: "1" or "123"
 * - Base URL: https://www.thesportsdb.com/api/v1/json
 */
export class TheSportsDBClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: TheSportsDBConfig = {}) {
    // V1 API: デフォルトで無料キー "123" を使用（"1" も使用可能）
    // V1 API: Use free key "123" by default ("1" is also available)
    this.apiKey = config.apiKey || process.env.THESPORTSDB_API_KEY || "123";
    this.baseUrl = config.baseUrl || "https://www.thesportsdb.com/api/v1/json";
    this.timeout = config.timeout || 10000;
  }

  /**
   * APIリクエストを実行（V1 API）
   * Execute API request (V1 API)
   *
   * V1 API では、API key を URL に含める必要があります
   * V1 API requires API key to be included in the URL
   * 形式: https://www.thesportsdb.com/api/v1/json/{API_KEY}/endpoint.php
   * Format: https://www.thesportsdb.com/api/v1/json/{API_KEY}/endpoint.php
   */
  private async request<T>(endpoint: string): Promise<T> {
    // V1 API: API key を URL に含める
    // V1 API: Include API key in URL
    const url = `${this.baseUrl}/${this.apiKey}/${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`[TheSportsDB V1] Requesting: ${url}`);

      const response = await fetch(url, {
        // V1 API: header に API key は不要
        // V1 API: No API key in header needed
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // レスポンステキストを取得（エラーメッセージのため）
      // Get response text (for error messages)
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `TheSportsDB API error: ${response.status} ${response.statusText}`;

        // JSONエラーメッセージを解析
        // Parse JSON error message
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // JSON解析に失敗した場合はテキストを使用
          // Use text if JSON parsing fails
          if (responseText) {
            errorMessage = responseText;
          }
        }

        console.error(`[TheSportsDB V1] API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      // JSONレスポンスを解析
      // Parse JSON response
      const data = JSON.parse(responseText) as T;
      console.log(
        `[TheSportsDB V1] Successfully fetched data from ${endpoint}`
      );
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        console.error(`[TheSportsDB V1] Request failed: ${error.message}`);
        throw new Error(`TheSportsDB API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * リーグIDで次のイベントを検索
   * Search next events by league ID
   * Uses eventsnextleague.php endpoint for upcoming events
   */
  async getNextEventsByLeague(leagueId: string): Promise<UnifiedEventData[]> {
    try {
      // TheSportsDB API v1 エンドポイント: eventsnextleague.php?id={leagueId}
      // TheSportsDB API v1 endpoint: eventsnextleague.php?id={leagueId}
      // This endpoint returns upcoming events for a league
      // URL形式: /api/v1/json/{API_KEY}/eventsnextleague.php?id={leagueId}
      // URL format: /api/v1/json/{API_KEY}/eventsnextleague.php?id={leagueId}
      const data = await this.request<
        z.infer<typeof TheSportsDBResponseSchema>
      >(`eventsnextleague.php?id=${leagueId}`);

      // エラーメッセージをチェック
      // Check for error messages
      if (data.message && data.message.toLowerCase().includes("error")) {
        console.warn(
          `API returned error message for league ${leagueId}: ${data.message}`
        );
        return [];
      }

      if (data.error) {
        console.warn(
          `API returned error for league ${leagueId}: ${data.error}`
        );
        return [];
      }

      // レスポンス形式に応じてイベントを抽出
      // Extract events based on response format
      const events = data.events || (data.event ? [data.event] : []);

      if (!events || events.length === 0) {
        console.log(`No events found for league ${leagueId}`);
        return [];
      }

      console.log(`Found ${events.length} events for league ${leagueId}`);

      const transformedEvents = events
        .map((event, index) => {
          const transformed = this.transformEvent(event);
          if (!transformed) {
            console.warn(
              `Failed to transform event ${index + 1}/${events.length}:`,
              event.idEvent
            );
          }
          return transformed;
        })
        .filter((event): event is UnifiedEventData => event !== null);

      console.log(
        `Successfully transformed ${transformedEvents.length}/${events.length} events for league ${leagueId}`
      );
      return transformedEvents;
    } catch (error) {
      console.error(
        `Error fetching next events for league ${leagueId}:`,
        error
      );
      // エラーが発生しても空配列を返して続行
      // Return empty array on error to continue
      return [];
    }
  }

  /**
   * リーグIDでイベントを検索（後方互換性のため）
   * Search events by league ID (for backward compatibility)
   */
  async getEventsByLeague(leagueId: string): Promise<UnifiedEventData[]> {
    return this.getNextEventsByLeague(leagueId);
  }

  /**
   * 日付範囲でイベントを検索
   * Search events by date range
   * Fetches events from combat sports leagues and filters by date range
   */
  async getEventsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<UnifiedEventData[]> {
    try {
      console.log(
        `Fetching fighting events for date range: ${startDate} to ${endDate}`
      );

      // 格闘技リーグからイベントを取得
      // Fetch events from combat sports leagues
      const combatLeagues = [
        { id: "4445", name: "Boxing", sportType: "boxing" as const },
        { id: "4443", name: "UFC", sportType: "ufc" as const },
      ];

      console.log(
        `[Sync] Fetching events from ${combatLeagues.length} leagues...`
      );

      const leaguePromises = combatLeagues.map((league) =>
        this.getNextEventsByLeague(league.id)
          .then((events) => {
            const eventsWithSportType = events.map((event) => ({
              ...event,
              sport_type: league.sportType,
            }));
            console.log(
              `[Sync] Fetched ${eventsWithSportType.length} events from ${league.name} (ID: ${league.id})`
            );
            return { league: league.name, events: eventsWithSportType };
          })
          .catch((error) => {
            console.error(
              `[Sync] Failed to fetch events for ${league.name} (ID: ${league.id}):`,
              error
            );
            return { league: league.name, events: [] };
          })
      );

      const leagueResults = await Promise.all(leaguePromises);
      const allEvents = leagueResults.flatMap((result) => result.events);

      console.log(
        `[Sync] Total events fetched from all leagues: ${allEvents.length}`
      );

      // 日付範囲でフィルタリング
      // Filter by date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredEvents = allEvents.filter((event) => {
        const eventDate = new Date(event.fight_date);
        const isInRange = eventDate >= start && eventDate <= end;

        if (!isInRange) {
          console.log(
            `[Sync] Event "${
              event.name
            }" (${event.fight_date.toISOString()}) is outside date range (${startDate} to ${endDate})`
          );
        }

        return isInRange;
      });

      console.log(
        `[Sync] Filtered to ${filteredEvents.length} events within date range (${startDate} to ${endDate})`
      );

      if (filteredEvents.length === 0 && allEvents.length > 0) {
        console.warn(
          `[Sync] WARNING: All ${allEvents.length} events were filtered out by date range!`
        );
        console.warn(`[Sync] Date range: ${startDate} to ${endDate}`);
        console.warn(
          `[Sync] Sample event dates:`,
          allEvents.slice(0, 3).map((e) => ({
            name: e.name,
            date: e.fight_date.toISOString(),
          }))
        );
      }

      return filteredEvents;
    } catch (error) {
      console.error("Error fetching events by date range:", error);
      throw error;
    }
  }

  /**
   * TheSportsDBイベントデータを統一フォーマットに変換
   * Transform TheSportsDB event data to unified format
   */
  private transformEvent(
    event: z.infer<typeof TheSportsDBEventSchema>
  ): UnifiedEventData | null {
    try {
      // イベント名を取得（V1 API では strEvent が直接利用可能）
      // Get event name (V1 API provides strEvent directly)
      const eventName = event.strEvent;

      if (!eventName) {
        console.warn("Event name is missing, skipping event:", event.idEvent);
        return null;
      }

      // スポーツタイプを判定
      // Determine sport type
      const sportType = this.determineSportType(
        event.strSport,
        event.strLeague
      );

      // 日付をパース（strTimestamp または dateEvent を使用）
      // Parse date (use strTimestamp or dateEvent)
      let fightDate: Date;
      if (event.strTimestamp) {
        fightDate = new Date(event.strTimestamp);
      } else if (event.dateEvent) {
        // dateEvent は "YYYY-MM-DD" 形式なので、時間を追加
        // dateEvent is in "YYYY-MM-DD" format, so add time
        fightDate = new Date(event.dateEvent + "T00:00:00");
      } else {
        console.warn("Invalid date, skipping event:", event.idEvent, {
          strTimestamp: event.strTimestamp,
          dateEvent: event.dateEvent,
        });
        return null;
      }

      if (isNaN(fightDate.getTime())) {
        console.warn("Invalid date parsed, skipping event:", event.idEvent, {
          strTimestamp: event.strTimestamp,
          dateEvent: event.dateEvent,
          parsedDate: fightDate,
        });
        return null;
      }

      return {
        external_id: event.idEvent,
        name: eventName,
        fight_date: fightDate,
        sport_type: sportType,
        external_data: event as unknown as Record<string, unknown>,
        home_team: event.strHomeTeam || undefined,
        away_team: event.strAwayTeam || undefined,
        venue: event.strVenue || undefined,
        league: event.strLeague || undefined,
        country: event.strCountry || undefined,
        city: event.strCity || undefined,
        status: event.strStatus || undefined,
      };
    } catch (error) {
      console.error("Error transforming event:", error);
      return null;
    }
  }

  /**
   * スポーツタイプを判定
   * Determine sport type
   */
  private determineSportType(
    sport: string | null | undefined,
    league: string | null | undefined
  ): "boxing" | "ufc" | "mma" | "other" {
    const sportLower = sport?.toLowerCase() || "";
    const leagueLower = league?.toLowerCase() || "";

    if (sportLower.includes("boxing") || leagueLower.includes("boxing")) {
      return "boxing";
    }
    if (
      sportLower.includes("ufc") ||
      leagueLower.includes("ufc") ||
      leagueLower.includes("ultimate fighting")
    ) {
      return "ufc";
    }
    if (sportLower.includes("mma") || leagueLower.includes("mma")) {
      return "mma";
    }

    return "other";
  }
}

/**
 * TheSportsDBイベントを統一フォーマットに変換（ユーティリティ関数）
 * Transform TheSportsDB event to unified format (utility function)
 */
export function transformTheSportsDBEvent(
  event: unknown,
  apiKey?: string
): UnifiedEventData | null {
  try {
    const parsed = TheSportsDBEventSchema.parse(event);
    const client = new TheSportsDBClient({
      apiKey: apiKey || process.env.THESPORTSDB_API_KEY || "",
    });
    // 一時的にアクセス可能にするため、内部メソッドを公開
    // Temporarily expose internal method for access
    return (client as any).transformEvent(parsed);
  } catch (error) {
    console.error("Error transforming TheSportsDB event:", error);
    return null;
  }
}
