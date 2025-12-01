import type { FighterPublic, FighterWithEvents } from "@/lib/types";
import type { Prisma } from "@prisma/client";
import { convertJsonValue } from "@/lib/utils/transformers";

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
    gender: fighter.gender,
    titles: fighter.titles,
    position: fighter.position,
    description: fighter.description,
    thumb: fighter.thumb,
    cutout: fighter.cutout,
    sport_type: fighter.sport_type as FighterPublic["sport_type"],
    external_data: convertJsonValue(fighter.external_data) as FighterPublic["external_data"],
  };
}

/**
 * Convert Prisma Fighter with relations to FighterWithEvents
 * 將帶關聯的 Prisma Fighter 轉換為 FighterWithEvents
 * 
 * This utility function handles the type conversion from Prisma's Fighter
 * (with fightsAsFighter and fightsAsOpponent relations) to FighterWithEvents from lib/types.
 * Merges both relations into fightsAsFighter array.
 * 
 * 此工具函數處理從 Prisma 的 Fighter（含 fightsAsFighter 和 fightsAsOpponent 關聯）
 * 到 lib/types 中的 FighterWithEvents 的類型轉換。
 * 將兩個關聯合併到 fightsAsFighter 數組中。
 */
export function toFighterWithEvents(
  fighter: Prisma.FighterGetPayload<{
    include: {
      fightsAsFighter: {
        include: {
          event: true;
          fighter?: true;
          opponent: true;
        };
      };
      fightsAsOpponent?: {
        include: {
          event: true;
          fighter: true;
          opponent?: true;
        };
      };
    };
  }>
): FighterWithEvents {
  // 轉換fightsAsFighter
  // Convert fightsAsFighter
  const fightsAsFighter = fighter.fightsAsFighter.map((fe) => ({
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
    event: fe.event as FighterWithEvents["fightsAsFighter"][0]["event"],
    fighter: fe.fighter
      ? ({
          id: fe.fighter.id,
          slug: fe.fighter.slug,
          name: fe.fighter.name,
          external_id: fe.fighter.external_id,
          external_source: fe.fighter.external_source,
          external_data: convertJsonValue(fe.fighter.external_data) as FighterWithEvents["external_data"],
          sport_type: fe.fighter.sport_type as FighterWithEvents["sport_type"],
          nationality: fe.fighter.nationality,
          date_born: fe.fighter.date_born,
          height: fe.fighter.height,
          weight: fe.fighter.weight,
          gender: fe.fighter.gender,
          titles: fe.fighter.titles,
          position: fe.fighter.position,
          description: fe.fighter.description,
          thumb: fe.fighter.thumb,
          cutout: fe.fighter.cutout,
          last_synced_at: fe.fighter.last_synced_at,
          createdAt: fe.fighter.createdAt,
          updatedAt: fe.fighter.updatedAt,
        } as FighterWithEvents["fightsAsFighter"][0]["fighter"])
      : (null as any), // Type assertion needed because fighter should always exist in fightsAsFighter
    opponent: fe.opponent
      ? {
          id: fe.opponent.id,
          slug: fe.opponent.slug,
          name: fe.opponent.name,
          external_id: fe.opponent.external_id,
          external_source: fe.opponent.external_source,
          external_data: convertJsonValue(fe.opponent.external_data) as FighterWithEvents["external_data"],
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
  }));

  // 轉換fightsAsOpponent（如果存在），需要交換fighter和opponent的角色，並反轉結果
  // Convert fightsAsOpponent (if exists), need to swap fighter and opponent roles, and reverse result
  // 注意：在fightsAsOpponent中，fe.fighter_id是對手的ID，fe.opponent_id是當前選手的ID
  // Note: In fightsAsOpponent, fe.fighter_id is opponent's ID, fe.opponent_id is current fighter's ID
  const fightsAsOpponent = fighter.fightsAsOpponent
    ? fighter.fightsAsOpponent.map((fe: any) => {
        // 反轉結果（因為結果是從fighter角度記錄的，當選手是opponent時需要反轉）
        // Reverse result (because result is recorded from fighter's perspective, need to reverse when fighter is opponent)
        let reversedResult = fe.result;
        if (fe.result) {
          const resultLower = fe.result.toLowerCase();
          if (resultLower.includes("win")) {
            reversedResult = "Loss"; // fighter贏了，opponent輸了
          } else if (resultLower.includes("loss")) {
            reversedResult = "Win"; // fighter輸了，opponent贏了
          }
          // draw 和 nc 不需要反轉
          // draw and nc don't need reversal
        }
        
        return {
          id: fe.id,
          fighter_id: fe.opponent_id || fe.fighter_id, // 交換：使用opponent_id作為fighter_id（從當前選手角度）
          event_id: fe.event_id,
          opponent_id: fe.fighter_id, // 交換：使用fighter_id作為opponent_id（對手）
          result: reversedResult,
          method: fe.method,
          round: fe.round,
          time: fe.time,
          weight_class: fe.weight_class,
          createdAt: fe.createdAt,
          updatedAt: fe.updatedAt,
          event: fe.event as FighterWithEvents["fightsAsFighter"][0]["event"],
          fighter: fe.opponent
            ? {
                id: fe.opponent.id,
                slug: fe.opponent.slug,
                name: fe.opponent.name,
                external_id: fe.opponent.external_id,
                external_source: fe.opponent.external_source,
                external_data: convertJsonValue(fe.opponent.external_data) as FighterWithEvents["external_data"],
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
          opponent: fe.fighter
            ? {
                id: fe.fighter.id,
                slug: fe.fighter.slug,
                name: fe.fighter.name,
                external_id: fe.fighter.external_id,
                external_source: fe.fighter.external_source,
                external_data: convertJsonValue(fe.fighter.external_data) as FighterWithEvents["external_data"],
                sport_type: fe.fighter.sport_type as FighterWithEvents["sport_type"],
                nationality: fe.fighter.nationality,
                date_born: fe.fighter.date_born,
                height: fe.fighter.height,
                weight: fe.fighter.weight,
                position: fe.fighter.position,
                description: fe.fighter.description,
                thumb: fe.fighter.thumb,
                cutout: fe.fighter.cutout,
                last_synced_at: fe.fighter.last_synced_at,
                createdAt: fe.fighter.createdAt,
                updatedAt: fe.fighter.updatedAt,
              }
            : null,
        };
      })
    : [];

  // 合併兩個列表，按日期排序，去重（基於fight id）
  // Merge both lists, sort by date, deduplicate (based on fight id)
  const allFights = [...fightsAsFighter, ...fightsAsOpponent];
  const uniqueFights = Array.from(
    new Map(allFights.map((fight) => [fight.id, fight])).values()
  );
  uniqueFights.sort((a, b) => {
    const dateA = new Date(a.event.fight_date).getTime();
    const dateB = new Date(b.event.fight_date).getTime();
    return dateB - dateA; // 降序排列 / Descending order
  });

  return {
    id: fighter.id,
    slug: fighter.slug,
    name: fighter.name,
    external_id: fighter.external_id,
    external_source: fighter.external_source,
    external_data: convertJsonValue(fighter.external_data) as FighterWithEvents["external_data"],
    sport_type: fighter.sport_type as FighterWithEvents["sport_type"],
    nationality: fighter.nationality,
    date_born: fighter.date_born,
    height: fighter.height,
    weight: fighter.weight,
    gender: fighter.gender,
    titles: fighter.titles,
    position: fighter.position,
    description: fighter.description,
    thumb: fighter.thumb,
    cutout: fighter.cutout,
    last_synced_at: fighter.last_synced_at,
    createdAt: fighter.createdAt,
    updatedAt: fighter.updatedAt,
    fightsAsFighter: uniqueFights.slice(0, 10) as FighterWithEvents["fightsAsFighter"], // 只保留最近10場 / Keep only 10 most recent
    fightsAsOpponent: [] as FighterWithEvents["fightsAsOpponent"], // Empty array since we merged into fightsAsFighter
  };
}
