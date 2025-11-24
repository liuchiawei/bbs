/**
 * Event Matcher Utilities
 * 賽事匹配工具函數
 * Provides fuzzy matching logic for event deduplication
 * 提供模糊匹配邏輯用於賽事去重
 */

import type { Event, UnifiedEventData } from "@/lib/types";

/**
 * Normalize event name for comparison
 * 標準化賽事名稱以便比較
 * Removes special characters, converts to lowercase, trims whitespace
 * 移除特殊字元、轉換為小寫、去除空白
 */
export function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // 移除特殊字元 / Remove special characters
    .replace(/\s+/g, " "); // 統一空白 / Normalize whitespace
}

/**
 * Calculate Levenshtein distance between two strings
 * 計算兩個字串之間的 Levenshtein 距離
 * Returns similarity score (0-1, where 1 is identical)
 * 返回相似度分數（0-1，1 表示完全相同）
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  // 初始化矩陣
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  // 填充矩陣
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate name similarity score (0-1)
 * 計算名稱相似度分數（0-1）
 * Uses normalized names and Levenshtein distance
 * 使用標準化名稱和 Levenshtein 距離
 */
export function calculateNameSimilarity(
  name1: string,
  name2: string
): number {
  const normalized1 = normalizeEventName(name1);
  const normalized2 = normalizeEventName(name2);

  // Exact match after normalization
  // 標準化後完全匹配
  if (normalized1 === normalized2) {
    return 1.0;
  }

  // Calculate similarity using Levenshtein distance
  // 使用 Levenshtein 距離計算相似度
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = 1 - distance / maxLength;

  return Math.max(0, similarity);
}

/**
 * Check if two dates are within tolerance range
 * 檢查兩個日期是否在容差範圍內
 * @param date1 First date
 * @param date2 Second date
 * @param toleranceDays Number of days tolerance (default: 1)
 * @returns true if dates are within range
 */
export function isDateWithinRange(
  date1: Date,
  date2: Date,
  toleranceDays: number = 1
): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Set to midnight for accurate day comparison
  // 設定為午夜以便準確比較日期
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays <= toleranceDays;
}

/**
 * Event match result
 * 賽事匹配結果
 * Note: EventMatchResult type is also defined in lib/types.ts for consistency
 * 注意：EventMatchResult 類型也在 lib/types.ts 中定義以保持一致性
 */
export interface EventMatchResult {
  event: Event;
  similarityScore: number;
  matchType: "exact" | "fuzzy";
}

/**
 * Find matching event using fuzzy matching
 * 使用模糊匹配查找匹配的賽事
 * Searches for events without external_id that match the unified event
 * 搜尋沒有 external_id 的賽事，匹配統一格式的賽事
 *
 * @param unifiedEvent External API event data
 * @param candidateEvents List of candidate events from database
 * @param minSimilarity Minimum similarity threshold (default: 0.8)
 * @returns Match result or null if no match found
 */
export function findMatchingEvent(
  unifiedEvent: UnifiedEventData,
  candidateEvents: Event[],
  minSimilarity: number = 0.8
): EventMatchResult | null {
  let bestMatch: EventMatchResult | null = null;
  let bestScore = 0;

  for (const candidate of candidateEvents) {
    // Skip events that already have external_id (they should be matched by exact match)
    // 跳過已有 external_id 的賽事（它們應該通過精確匹配）
    // Type assertion needed because Event type may not include external_id
    // 類型斷言是必要的，因為 Event 類型可能不包含 external_id
    if ((candidate as any).external_id) {
      continue;
    }

    // Calculate name similarity
    // 計算名稱相似度
    const nameSimilarity = calculateNameSimilarity(
      unifiedEvent.name,
      candidate.name
    );

    // Check date match
    // 檢查日期匹配
    const dateMatch = isDateWithinRange(
      unifiedEvent.fight_date,
      new Date(candidate.fight_date),
      1 // ±1 day tolerance
    );

    // Check sport type match
    // 檢查運動類型匹配
    const sportTypeMatch =
      !unifiedEvent.sport_type ||
      !candidate.sport_type ||
      unifiedEvent.sport_type === candidate.sport_type;

    // Calculate combined score
    // 計算組合分數
    // Name similarity: 70%, Date match: 20%, Sport type: 10%
    // 名稱相似度：70%，日期匹配：20%，運動類型：10%
    let combinedScore = nameSimilarity * 0.7;
    if (dateMatch) {
      combinedScore += 0.2;
    }
    if (sportTypeMatch) {
      combinedScore += 0.1;
    }

    // Update best match if this is better
    // 如果這個匹配更好，更新最佳匹配
    if (combinedScore > bestScore && combinedScore >= minSimilarity) {
      bestScore = combinedScore;
      bestMatch = {
        event: candidate,
        similarityScore: combinedScore,
        matchType: "fuzzy",
      };
    }
  }

  return bestMatch;
}

