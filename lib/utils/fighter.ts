import type { FighterPublic } from "@/lib/types";
import type { Prisma } from "@prisma/client";

/**
 * Convert JsonValue to Record<string, unknown> | null
 * 將 JsonValue 轉換為 Record<string, unknown> | null
 * 
 * Utility function to safely convert Prisma's JsonValue type
 * to the Record<string, unknown> | null type used in components.
 * 
 * 工具函數，安全地將 Prisma 的 JsonValue 類型轉換為
 * 組件使用的 Record<string, unknown> | null 類型。
 */
export function convertJsonValue(
  value: Prisma.JsonValue | null | undefined
): Record<string, unknown> | null {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null
  ) {
    return value as Record<string, unknown>;
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

