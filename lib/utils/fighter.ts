import type { FighterPublic, FighterWithEvents } from "@/lib/types";
import type { Prisma } from "@prisma/client";

/**
 * Convert JsonValue to Record<string, unknown> | null
 * 將 JsonValue 轉換為 Record<string, unknown> | null
 * 
 * Utility function to safely convert Prisma's JsonValue type
 * to the Record<string, unknown> | null type used in components.
 * 
 * This function ensures that external_data is always returned as a JSON object
 * (Record<string, unknown>), preserving all fields from the database.
 * 
 * Handles:
 * - Objects: returns as-is (preserves all fields)
 * - Arrays: if single element, returns that element; if multiple, returns first with warning
 * - Strings: attempts JSON parsing
 * - null/undefined: returns null
 * 
 * 工具函數，安全地將 Prisma 的 JsonValue 類型轉換為
 * 組件使用的 Record<string, unknown> | null 類型。
 * 
 * 此函數確保 external_data 始終作為 JSON 對象返回
 * (Record<string, unknown>)，保留資料庫中的所有字段。
 * 
 * 處理：
 * - 對象：直接返回（保留所有字段）
 * - 數組：如果只有一個元素，返回該元素；如果多個，返回第一個並警告
 * - 字符串：嘗試 JSON 解析
 * - null/undefined：返回 null
 */
export function convertJsonValue(
  value: Prisma.JsonValue | null | undefined
): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }

  // If it's an array, handle it specially
  // 如果是數組，特殊處理
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    if (value.length === 1) {
      // Single element array: return the element if it's an object
      // 單元素數組：如果是對象，返回該元素
      const element = value[0];
      if (
        element &&
        typeof element === "object" &&
        !Array.isArray(element) &&
        element !== null
      ) {
        // Return as JSON object, preserving all fields
        // 作為 JSON 對象返回，保留所有字段
        return element as Record<string, unknown>;
      }
      return null;
    }
    // Multiple elements: return first element with warning
    // 多個元素：返回第一個元素並警告
    const firstElement = value[0];
    if (
      firstElement &&
      typeof firstElement === "object" &&
      !Array.isArray(firstElement) &&
      firstElement !== null
    ) {
      console.warn(
        `[convertJsonValue] external_data contains array with ${value.length} elements, using first element. Fields: ${Object.keys(firstElement).join(", ")}`
      );
      // Return as JSON object, preserving all fields
      // 作為 JSON 對象返回，保留所有字段
      return firstElement as Record<string, unknown>;
    }
    return null;
  }

  // If it's already an object (not array), return it as-is
  // 如果已經是對象（非數組），直接返回，保留所有字段
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null
  ) {
    // Return as JSON object, preserving all fields
    // 作為 JSON 對象返回，保留所有字段
    return value as Record<string, unknown>;
  }

  // If it's a string, try to parse it as JSON
  // 如果是字符串，嘗試解析為 JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      // Recursively handle parsed value (could be object, array, etc.)
      // 遞歸處理解析後的值（可能是對象、數組等）
      return convertJsonValue(parsed);
    } catch (e) {
      // If parsing fails, return null
      // 如果解析失敗，返回 null
      console.warn("[convertJsonValue] Failed to parse JSON string:", e);
    }
  }

  return null;
}

/**
 * Convert Prisma Fighter to FighterPublic
 * 將 Prisma Fighter 轉換為 FighterPublic
 * 
 * This utility function handles the type conversion from Prisma's Fighter
 * (with JsonValue) to FighterPublic used in components.
 * 
 * 此工具函數處理從 Prisma 的 Fighter（含 JsonValue）
 * 到組件使用的 FighterPublic 的類型轉換。
 */
export function toFighterPublic(
  fighter: Prisma.FighterGetPayload<Record<string, never>>
): FighterPublic {
  return {
    id: fighter.id,
    name: fighter.name,
    slug: fighter.slug,
    nationality: fighter.nationality,
    date_born: fighter.date_born,
    height: fighter.height,
    weight: fighter.weight,
    position: fighter.position,
    description: fighter.description,
    thumb: fighter.thumb,
    cutout: fighter.cutout,
    sport_type: fighter.sport_type as FighterPublic["sport_type"],
    external_data: convertJsonValue(fighter.external_data),
  };
}

/**
 * Convert Prisma Fighter with relations to FighterWithEvents
 * 將帶關聯的 Prisma Fighter 轉換為 FighterWithEvents
 * 
 * This utility function handles the type conversion from Prisma's Fighter
 * (with eventsAsFighter relations) to FighterWithEvents from lib/types.
 * 
 * 此工具函數處理從 Prisma 的 Fighter（含 eventsAsFighter 關聯）
 * 到 lib/types 中的 FighterWithEvents 的類型轉換。
 */
export function toFighterWithEvents(
  fighter: Prisma.FighterGetPayload<{
    include: {
      eventsAsFighter: {
        include: {
          event: true;
          opponent: true;
        };
      };
    };
  }>
): FighterWithEvents {
  return {
    id: fighter.id,
    slug: fighter.slug,
    name: fighter.name,
    external_id: fighter.external_id,
    external_source: fighter.external_source,
    external_data: convertJsonValue(fighter.external_data),
    sport_type: fighter.sport_type as FighterWithEvents["sport_type"],
    nationality: fighter.nationality,
    date_born: fighter.date_born,
    height: fighter.height,
    weight: fighter.weight,
    position: fighter.position,
    description: fighter.description,
    thumb: fighter.thumb,
    cutout: fighter.cutout,
    last_synced_at: fighter.last_synced_at,
    createdAt: fighter.createdAt,
    updatedAt: fighter.updatedAt,
    eventsAsFighter: fighter.eventsAsFighter.map((fe) => ({
      id: fe.id,
      fighter_id: fe.fighter_id,
      event_id: fe.event_id,
      opponent_id: fe.opponent_id,
      result: fe.result,
      method: fe.method,
      round: fe.round,
      time: fe.time,
      weight_class: fe.weight_class,
      createdAt: fe.createdAt,
      updatedAt: fe.updatedAt,
      event: fe.event as FighterWithEvents["eventsAsFighter"][0]["event"],
      opponent: fe.opponent
        ? {
            id: fe.opponent.id,
            slug: fe.opponent.slug,
            name: fe.opponent.name,
            external_id: fe.opponent.external_id,
            external_source: fe.opponent.external_source,
            external_data: convertJsonValue(fe.opponent.external_data),
            sport_type: fe.opponent.sport_type as FighterWithEvents["sport_type"],
            nationality: fe.opponent.nationality,
            date_born: fe.opponent.date_born,
            height: fe.opponent.height,
            weight: fe.opponent.weight,
            position: fe.opponent.position,
            description: fe.opponent.description,
            thumb: fe.opponent.thumb,
            cutout: fe.opponent.cutout,
            last_synced_at: fe.opponent.last_synced_at,
            createdAt: fe.opponent.createdAt,
            updatedAt: fe.opponent.updatedAt,
          }
        : null,
    })),
  };
}

