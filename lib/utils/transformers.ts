/**
 * Type Transformers
 * 類型轉換工具
 * 
 * 統一處理 Prisma 結果到應用類型的轉換
 * Unified handling of Prisma result to application type conversions
 */

import { Prisma } from "@prisma/client";
import type { PrismaToApp } from "@/lib/types/utilities";

// ============================================================================
// JsonValue Converter
// ============================================================================

/**
 * Convert JsonValue to Record<string, unknown> | null
 * 將 JsonValue 轉換為 Record<string, unknown> | null
 * 
 * Utility function to safely convert Prisma's JsonValue type
 * to the Record<string, unknown> | null type used in components.
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
      return firstElement as Record<string, unknown>;
    }
    return null;
  }

  // If it's already an object (not array), return it as-is
  // 如果已經是對象（非數組），直接返回
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null
  ) {
    return value as Record<string, unknown>;
  }

  // If it's a string, try to parse it as JSON
  // 如果是字符串，嘗試解析為 JSON
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return null;
}

// ============================================================================
// Decimal Converter
// ============================================================================

/**
 * Convert Prisma Decimal to number
 * 將 Prisma Decimal 轉換為 number
 */
export function convertDecimal(
  value: Prisma.Decimal | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

/**
 * Convert Prisma Decimal to string
 * 將 Prisma Decimal 轉換為 string
 */
export function convertDecimalToString(
  value: Prisma.Decimal | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value.toString();
}

// ============================================================================
// Date Converter
// ============================================================================

/**
 * Convert Date to string or keep as Date
 * 將 Date 轉換為 string 或保持為 Date
 */
export function convertDate(
  value: Date | null | undefined
): Date | string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value;
}

/**
 * Convert Date to ISO string
 * 將 Date 轉換為 ISO string
 */
export function convertDateToISO(
  value: Date | null | undefined
): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value.toISOString();
}

// ============================================================================
// Generic Type Transformer
// ============================================================================

/**
 * Transform Prisma result to application type
 * 將 Prisma 結果轉換為應用類型
 * 
 * This function handles common Prisma type conversions:
 * - JsonValue -> Record<string, unknown> | null
 * - Decimal -> number | string
 * - Date -> Date | string
 */
export function transformPrismaResult<T>(result: T): PrismaToApp<T> {
  if (result === null || result === undefined) {
    return result as PrismaToApp<T>;
  }

  // Handle arrays
  if (Array.isArray(result)) {
    return result.map(transformPrismaResult) as PrismaToApp<T>;
  }

  // Handle objects
  if (typeof result === "object") {
    const transformed: any = {};
    for (const [key, value] of Object.entries(result)) {
      if (value instanceof Prisma.Decimal) {
        transformed[key] = Number(value);
      } else if (value instanceof Date) {
        transformed[key] = value;
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        // Check if it's JsonValue
        if (
          typeof (value as any).constructor === "function" &&
          (value as any).constructor.name === "Object"
        ) {
          transformed[key] = transformPrismaResult(value);
        } else {
          transformed[key] = convertJsonValue(value as Prisma.JsonValue);
        }
      } else {
        transformed[key] = transformPrismaResult(value);
      }
    }
    return transformed as PrismaToApp<T>;
  }

  return result as PrismaToApp<T>;
}

// ============================================================================
// Null/Undefined Helpers
// ============================================================================

/**
 * Convert null to undefined
 * 將 null 轉換為 undefined
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Convert undefined to null
 * 將 undefined 轉換為 null
 */
export function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Normalize null/undefined to null
 * 將 null/undefined 標準化為 null
 */
export function normalizeNull<T>(value: T | null | undefined): T | null {
  return value === null || value === undefined ? null : value;
}

/**
 * Normalize null/undefined to undefined
 * 將 null/undefined 標準化為 undefined
 */
export function normalizeUndefined<T>(
  value: T | null | undefined
): T | undefined {
  return value === null || value === undefined ? undefined : value;
}

