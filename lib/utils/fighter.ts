import type { FighterPublic, FighterWithEvents } from "@/lib/types";
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

