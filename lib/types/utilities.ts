/**
 * TypeScript Utility Types
 * TypeScript 工具類型
 * 
 * 提供可重用的類型組合工具，簡化複雜類型定義
 * Provides reusable type composition utilities to simplify complex type definitions
 */

import { Prisma } from "@prisma/client";

// ============================================================================
// Basic Utility Types
// ============================================================================

/**
 * 為類型添加關聯資料
 * Add relations to a type
 */
export type WithRelations<
  T,
  R extends Record<string, any>
> = T & R;

/**
 * 為類型添加計數統計
 * Add count statistics to a type
 */
export type WithCount<T, C extends Record<string, number> = Record<string, number>> = T & {
  _count: C;
};

/**
 * 分頁響應類型
 * Paginated response type
 */
export type Paginated<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * 將 Prisma Date 轉換為 string | Date
 * Convert Prisma Date to string | Date
 * 優先檢查 Date 類型，避免遞歸轉換問題
 * Check Date type first to avoid recursive conversion issues
 */
export type DateToString<T> = T extends Date
  ? Date | string
  : T extends Date | null
  ? Date | string | null
  : T extends Date | undefined
  ? Date | string | undefined
  : T extends Date | null | undefined
  ? Date | string | null | undefined
  : T extends (infer U)[]
  ? DateToString<U>[]
  : T extends Record<string, any>
  ? {
      [K in keyof T]: T[K] extends Date
        ? Date | string
        : T[K] extends Date | null
        ? Date | string | null
        : T[K] extends Date | undefined
        ? Date | string | undefined
        : T[K] extends Date | null | undefined
        ? Date | string | null | undefined
        : DateToString<T[K]>;
    }
  : T;

/**
 * 將 Prisma JsonValue 轉換為 Record<string, unknown> | null
 * Convert Prisma JsonValue to Record<string, unknown> | null
 */
export type JsonToRecord<T> = T extends Prisma.JsonValue
  ? Record<string, unknown> | null
  : T extends Prisma.JsonValue | null
  ? Record<string, unknown> | null
  : T extends Prisma.JsonValue | undefined
  ? Record<string, unknown> | null | undefined
  : T extends Prisma.JsonValue | null | undefined
  ? Record<string, unknown> | null | undefined
  : T extends object
  ? { [K in keyof T]: JsonToRecord<T[K]> }
  : T extends (infer U)[]
  ? JsonToRecord<U>[]
  : T;

/**
 * 將 Prisma Decimal 轉換為 number | string
 * Convert Prisma Decimal to number | string
 */
export type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number | string
  : T extends Prisma.Decimal | null
  ? number | string | null
  : T extends Prisma.Decimal | undefined
  ? number | string | undefined
  : T extends Prisma.Decimal | null | undefined
  ? number | string | null | undefined
  : T extends object
  ? { [K in keyof T]: DecimalToNumber<T[K]> }
  : T extends (infer U)[]
  ? DecimalToNumber<U>[]
  : T;

/**
 * 組合所有 Prisma 類型轉換
 * Combine all Prisma type conversions
 * 基本類型（string, number, boolean, Date）保持不變或適當轉換
 * Basic types (string, number, boolean, Date) remain unchanged or properly converted
 */
export type PrismaToApp<T> = T extends Date
  ? Date | string
  : T extends Date | null
  ? Date | string | null
  : T extends Date | undefined
  ? Date | string | undefined
  : T extends Date | null | undefined
  ? Date | string | null | undefined
  : T extends string | number | boolean | null | undefined
  ? T
  : T extends (infer U)[]
  ? PrismaToApp<U>[]
  : T extends Record<string, any>
  ? {
      [K in keyof T]: PrismaToApp<T[K]>;
    }
  : DateToString<JsonToRecord<DecimalToNumber<T>>>;

// ============================================================================
// Prisma GetPayload Helpers
// ============================================================================

/**
 * 從 Prisma Select 生成應用類型
 * Generate application type from Prisma Select
 * 
 * Note: This utility type is not currently used, but kept for future reference
 * 注意：此工具類型目前未使用，但保留以供將來參考
 */
// export type FromSelect<
//   Model extends keyof Prisma.ModelName,
//   Select extends Prisma.Args<Prisma.GetPayload<{ model: Model }>, "select">
// > = PrismaToApp<
//   Prisma.GetPayload<{
//     model: Model;
//     select: Select;
//   }>
// >;

/**
 * 從 Prisma Include 生成應用類型
 * Generate application type from Prisma Include
 * 
 * Note: This utility type is not currently used, but kept for future reference
 * 注意：此工具類型目前未使用，但保留以供將來參考
 */
// export type FromInclude<
//   Model extends keyof Prisma.ModelName,
//   Include extends Prisma.Args<Prisma.GetPayload<{ model: Model }>, "include">
// > = PrismaToApp<
//   Prisma.GetPayload<{
//     model: Model;
//     include: Include;
//   }>
// >;

// ============================================================================
// Common Type Combinations
// ============================================================================

/**
 * 帶有分頁的列表響應
 * List response with pagination
 */
export type PaginatedResponse<T> = Paginated<T>;

/**
 * API 響應包裝器
 * API response wrapper
 */
export type ApiResponse<T = any> = {
  message?: string;
  error?: string;
  data?: T;
};

/**
 * API 錯誤響應
 * API error response
 */
export type ApiErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};

// ============================================================================
// Optional Fields Helpers
// ============================================================================

/**
 * 將類型的所有欄位設為可選（深度）
 * Make all fields optional (deep)
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * 將類型的所有欄位設為必填（深度）
 * Make all fields required (deep)
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/**
 * 將類型的所有 null 欄位轉換為 undefined
 * Convert all null fields to undefined
 */
export type NullToUndefined<T> = T extends null
  ? undefined
  : T extends null | undefined
  ? undefined
  : T extends object
  ? { [K in keyof T]: NullToUndefined<T[K]> }
  : T extends (infer U)[]
  ? NullToUndefined<U>[]
  : T;

/**
 * 將類型的所有 undefined 欄位轉換為 null
 * Convert all undefined fields to null
 */
export type UndefinedToNull<T> = T extends undefined
  ? null
  : T extends undefined | null
  ? null
  : T extends object
  ? { [K in keyof T]: UndefinedToNull<T[K]> }
  : T extends (infer U)[]
  ? UndefinedToNull<U>[]
  : T;

// ============================================================================
// Array Helpers
// ============================================================================

/**
 * 確保類型為陣列
 * Ensure type is an array
 */
export type EnsureArray<T> = T extends any[] ? T : T[];

/**
 * 取得陣列元素類型
 * Get array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// ============================================================================
// Object Helpers
// ============================================================================

/**
 * 選擇物件中的特定鍵
 * Pick specific keys from object
 */
export type PickKeys<T, K extends keyof T> = Pick<T, K>;

/**
 * 排除物件中的特定鍵
 * Omit specific keys from object
 */
export type OmitKeys<T, K extends keyof T> = Omit<T, K>;

/**
 * 扁平化物件類型（一層）
 * Flatten object type (one level)
 */
export type Flatten<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? T[K] extends any[]
          ? T[K]
          : Flatten<T[K]>
        : T[K];
    }
  : T;

