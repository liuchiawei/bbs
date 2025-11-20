/**
 * Fighter Service
 * 選手服務層
 * Handles fighter data operations and API synchronization
 */

import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { TheSportsDBClient } from "@/lib/adapters/thesportsdb";
import {
  generateSlug,
  generateUniqueSlug,
  slugToPossibleNames,
} from "@/lib/utils/slug";
import type { SportType } from "@/lib/types";

/**
 * Get fighter from database (cached)
 * 從資料庫取得選手（快取）
 *
 * This function only queries the database and uses cache.
 * On-demand sync logic is separated to avoid caching failures.
 *
 * 此函數僅查詢資料庫並使用快取。
 * on-demand 同步邏輯已分離，避免快取失敗結果。
 */
async function _getFighterFromDB(slug: string) {
  return unstable_cache(
    async () => {
      return await prisma.fighter.findUnique({
        where: { slug },
        include: {
          eventsAsFighter: {
            include: {
              event: true,
              opponent: true,
            },
            orderBy: {
              event: {
                fight_date: "desc",
              },
            },
          },
        },
      });
    },
    [`fighter-db-${slug}`],
    {
      tags: ["fighters", `fighter-${slug}`],
      revalidate: 300, // 5分鐘 / 5 minutes
    }
  )();
}

/**
 * Sync fighter on-demand from API (not cached)
 * 從 API 進行 on-demand 同步（不快取）
 *
 * This function attempts to sync a fighter from TheSportsDB API
 * when not found in database. It does NOT use cache to ensure
 * failures don't prevent retries.
 *
 * 當資料庫找不到選手時，此函數嘗試從 TheSportsDB API 同步。
 * 不使用快取，確保失敗不會阻止重試。
 */
async function _syncFighterOnDemand(slug: string) {
  console.log(
    `[Fighter Sync] Fighter not found for slug "${slug}", attempting on-demand sync...`
  );

  try {
    // Step 2.1: Guess possible names from slug
    // 步驟2.1: 從 slug 推測可能的名字
    const possibleNames = slugToPossibleNames(slug);

    if (possibleNames.length === 0) {
      console.log(
        `[Fighter Sync] Could not generate possible names from slug "${slug}"`
      );
      return null;
    }

    // Step 2.2: Search API for each possible name
    // 步驟2.2: 對每個可能的名字搜尋 API
    const apiKey = process.env.THESPORTSDB_API_KEY || "123";
    const client = new TheSportsDBClient({ apiKey });

    let matchedPlayer: any = null;

    for (const name of possibleNames) {
      try {
        const searchResults = await client.searchPlayerByName(name);

        // 添加調試日誌：顯示搜尋結果數量
        // Add debug logs: show search results count
        console.log(
          `[Fighter Sync] Search results for "${name}": ${searchResults.length} result(s)`
        );

        // 如果只有一個搜尋結果，使用寬鬆匹配
        // If only one search result, use lenient matching
        if (searchResults.length === 1 && searchResults[0].strPlayer) {
          const singlePlayer = searchResults[0];
          const singlePlayerSlug = generateSlug(singlePlayer.strPlayer);
          const baseSlug = slug.replace(/-\d+$/, "");
          const baseSinglePlayerSlug = singlePlayerSlug.replace(/-\d+$/, "");

          console.log(
            `[Fighter Sync] Single result found: "${singlePlayer.strPlayer}" -> slug: "${singlePlayerSlug}" vs requested: "${slug}"`
          );
          console.log(
            `[Fighter Sync] Base slug comparison: "${baseSinglePlayerSlug}" vs "${baseSlug}"`
          );

          // 寬鬆匹配：基礎 slug 匹配即可（單結果時更寬鬆）
          // Lenient matching: base slug match is sufficient (more lenient for single result)
          if (singlePlayerSlug === slug || baseSinglePlayerSlug === baseSlug) {
            matchedPlayer = singlePlayer;
            console.log(
              `[Fighter Sync] Found matching player (single result): ${singlePlayer.strPlayer} (slug: ${singlePlayerSlug})`
            );
            break;
          } else {
            // 如果寬鬆匹配失敗，記錄原因
            // If lenient matching fails, log the reason
            console.log(
              `[Fighter Sync] Single result lenient match failed: "${singlePlayerSlug}" !== "${slug}" and "${baseSinglePlayerSlug}" !== "${baseSlug}"`
            );
          }
        }

        // 多個結果時，或單結果寬鬆匹配失敗時，使用嚴格匹配
        // When multiple results, or single result lenient match failed, use strict matching
        if (!matchedPlayer && searchResults.length > 0) {
          for (const player of searchResults) {
            if (!player.strPlayer) continue;

            const playerSlug = generateSlug(player.strPlayer);

            // 添加調試日誌
            // Add debug logs
            console.log(
              `[Fighter Sync] Checking player: "${player.strPlayer}" -> slug: "${playerSlug}" vs requested: "${slug}"`
            );

            // Check exact match or base slug match (ignoring number suffix)
            // 檢查精確匹配或基礎 slug 匹配（忽略數字後綴）
            const baseSlug = slug.replace(/-\d+$/, "");
            const basePlayerSlug = playerSlug.replace(/-\d+$/, "");

            console.log(
              `[Fighter Sync] Base slug comparison: "${basePlayerSlug}" vs "${baseSlug}"`
            );

            if (playerSlug === slug || basePlayerSlug === baseSlug) {
              matchedPlayer = player;
              console.log(
                `[Fighter Sync] Found matching player: ${player.strPlayer} (slug: ${playerSlug})`
              );
              break;
            }
          }
        }

        if (matchedPlayer) {
          break;
        }
      } catch (error) {
        console.error(
          `[Fighter Sync] Error searching for name "${name}":`,
          error
        );
        // Continue to next name
        // 繼續下一個名字
      }
    }

    if (!matchedPlayer) {
      console.log(`[Fighter Sync] No matching player found for slug "${slug}"`);
      return null;
    }

    // Step 2.3: Use idPlayer for precise lookup to get complete data
    // 步驟2.3: 使用 idPlayer 進行精準查找以獲取完整資料
    let finalPlayerData = matchedPlayer;

    if (matchedPlayer.idPlayer) {
      console.log(
        `[Fighter Sync] Found player with idPlayer: ${matchedPlayer.idPlayer}, fetching complete data via lookup...`
      );

      try {
        const precisePlayer = await client.getPlayerById(
          matchedPlayer.idPlayer
        );
        if (precisePlayer) {
          finalPlayerData = precisePlayer;
          console.log(
            `[Fighter Sync] Successfully fetched complete data for player: ${precisePlayer.strPlayer}`
          );
        } else {
          console.log(
            `[Fighter Sync] Lookup failed for idPlayer ${matchedPlayer.idPlayer}, using search result data`
          );
        }
      } catch (error) {
        console.error(
          `[Fighter Sync] Error fetching player by ID ${matchedPlayer.idPlayer}:`,
          error
        );
        // Fallback to search result data
        // 回退到搜尋結果資料
      }
    } else {
      console.log(
        `[Fighter Sync] Player has no idPlayer, using search result data`
      );
    }

    // Step 2.4: Create fighter record
    // 步驟2.4: 建立選手記錄
    const existingSlugs = await prisma.fighter.findMany({
      select: { slug: true },
    });
    const slugList = existingSlugs.map((f) => f.slug);
    const finalSlug = generateUniqueSlug(finalPlayerData.strPlayer, slugList);

    const fighter = await prisma.fighter.create({
      data: {
        slug: finalSlug,
        name: finalPlayerData.strPlayer,
        external_id: finalPlayerData.idPlayer || null,
        external_source: "thesportsdb",
        external_data: finalPlayerData,
        sport_type: determineSportTypeFromAPI(finalPlayerData),
        nationality: finalPlayerData.strNationality || null,
        date_born: finalPlayerData.dateBorn
          ? new Date(finalPlayerData.dateBorn)
          : null,
        height: finalPlayerData.strHeight || null,
        weight: finalPlayerData.strWeight || null,
        position: finalPlayerData.strPosition || null,
        description: finalPlayerData.strDescriptionEN || null,
        thumb: finalPlayerData.strThumb || null,
        cutout: finalPlayerData.strCutout || null,
        last_synced_at: new Date(),
      },
    });

    console.log(
      `[Fighter Sync] Successfully created fighter: ${fighter.name} (slug: ${fighter.slug})`
    );

    // 清除快取並重新查詢資料庫以獲取完整數據（含關聯）
    // Clear cache and re-query database to get complete data (with relations)
    revalidateTag(`fighter-${slug}`, "max");
    return await _getFighterFromDB(finalSlug);
  } catch (error) {
    console.error(
      `[Fighter Sync] Error during on-demand sync for slug "${slug}":`,
      error
    );
    // Return null on error (don't break the page)
    // 發生錯誤時返回 null（不影響頁面）
    return null;
  }
}

/**
 * Get fighter by slug with on-demand sync fallback
 * 依 slug 取得選手（含 on-demand 同步 fallback）
 *
 * If fighter is not found in database and trySync is true (default),
 * attempts to sync from TheSportsDB API by guessing the name from slug.
 *
 * 如果資料庫找不到選手且 trySync 為 true（預設），
 * 嘗試從 slug 推測名字並從 TheSportsDB API 同步
 *
 * Architecture:
 * - Step 1: Query database (cached)
 * - Step 2: If not found, attempt on-demand sync (not cached)
 *
 * 架構：
 * - 步驟1: 查詢資料庫（快取）
 * - 步驟2: 如果找不到，嘗試 on-demand 同步（不快取）
 */
export async function getFighterBySlug(
  slug: string,
  options?: { trySync?: boolean }
) {
  const trySync = options?.trySync !== false; // Default to true

  // Step 1: Try to find in database (cached)
  // 步驟1: 嘗試從資料庫查找（快取）
  let fighter = await _getFighterFromDB(slug);

  if (fighter) {
    return fighter;
  }

  // Step 2: If not found and trySync is enabled, attempt on-demand sync (not cached)
  // 步驟2: 如果找不到且啟用 trySync，嘗試 on-demand 同步（不快取）
  if (!trySync) {
    return null;
  }

  return await _syncFighterOnDemand(slug);
}

/**
 * Get or create fighter by name
 * 依名字取得或建立選手
 *
 * Strategy:
 * 1. Try to find by name (exact match)
 * 2. If not found, search API
 * 3. Create fighter record with generated slug
 */
export async function getOrCreateFighterByName(
  name: string,
  sportType?: SportType
): Promise<{ id: string; slug: string } | null> {
  if (!name || name.trim().length === 0) {
    return null;
  }

  const normalizedName = name.trim();

  // Step 1: Try to find existing fighter by name
  // 步驟1: 嘗試依名字找到現有選手
  let fighter = await prisma.fighter.findFirst({
    where: {
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
  });

  if (fighter) {
    return { id: fighter.id, slug: fighter.slug };
  }

  // Step 2: Search API for fighter
  // 步驟2: 從 API 搜尋選手
  const apiKey = process.env.THESPORTSDB_API_KEY || "123";
  const client = new TheSportsDBClient({ apiKey });

  let apiPlayer: any = null;

  try {
    const searchResults = await client.searchPlayerByName(normalizedName);

    // Try to find exact match first
    // 先嘗試精確匹配
    apiPlayer = searchResults.find(
      (p) => p.strPlayer?.toLowerCase() === normalizedName.toLowerCase()
    );

    // If no exact match, use first result
    // 如果沒有精確匹配，使用第一個結果
    if (!apiPlayer && searchResults.length > 0) {
      apiPlayer = searchResults[0];
    }
  } catch (error) {
    console.error(`Error searching for fighter "${normalizedName}":`, error);
  }

  // Step 3: Generate unique slug
  // 步驟3: 生成唯一 slug
  const existingSlugs = await prisma.fighter.findMany({
    select: { slug: true },
  });
  const slugList = existingSlugs.map((f) => f.slug);
  const slug = generateUniqueSlug(normalizedName, slugList);

  // Step 4: Create fighter record
  // 步驟4: 建立選手記錄
  try {
    fighter = await prisma.fighter.create({
      data: {
        slug,
        name: normalizedName,
        external_id: apiPlayer?.idPlayer || null,
        external_source: apiPlayer ? "thesportsdb" : null,
        external_data: apiPlayer || null,
        sport_type: sportType || determineSportTypeFromAPI(apiPlayer),
        nationality: apiPlayer?.strNationality || null,
        date_born: apiPlayer?.dateBorn ? new Date(apiPlayer.dateBorn) : null,
        height: apiPlayer?.strHeight || null,
        weight: apiPlayer?.strWeight || null,
        position: apiPlayer?.strPosition || null,
        description: apiPlayer?.strDescriptionEN || null,
        thumb: apiPlayer?.strThumb || null,
        cutout: apiPlayer?.strCutout || null,
        last_synced_at: apiPlayer ? new Date() : null,
      },
    });

    console.log(`Created fighter: ${fighter.name} (slug: ${fighter.slug})`);
    return { id: fighter.id, slug: fighter.slug };
  } catch (error) {
    console.error(`Error creating fighter "${normalizedName}":`, error);
    return null;
  }
}

/**
 * Sync fighter data from API
 * 從 API 同步選手資料
 */
export async function syncFighterFromAPI(fighterId: string): Promise<boolean> {
  try {
    const fighter = await prisma.fighter.findUnique({
      where: { id: fighterId },
    });

    if (!fighter || !fighter.external_id) {
      console.warn(`Fighter ${fighterId} has no external_id, cannot sync`);
      return false;
    }

    const apiKey = process.env.THESPORTSDB_API_KEY || "123";
    const client = new TheSportsDBClient({ apiKey });

    const apiPlayer = await client.getPlayerById(fighter.external_id);

    if (!apiPlayer) {
      console.warn(`No API data found for fighter ${fighterId}`);
      return false;
    }

    // Update fighter record
    // 更新選手記錄
    await prisma.fighter.update({
      where: { id: fighterId },
      data: {
        name: apiPlayer.strPlayer || fighter.name,
        external_data: apiPlayer,
        sport_type: determineSportTypeFromAPI(apiPlayer) || fighter.sport_type,
        nationality: apiPlayer.strNationality || fighter.nationality,
        date_born: apiPlayer.dateBorn
          ? new Date(apiPlayer.dateBorn)
          : fighter.date_born,
        height: apiPlayer.strHeight || fighter.height,
        weight: apiPlayer.strWeight || fighter.weight,
        position: apiPlayer.strPosition || fighter.position,
        description: apiPlayer.strDescriptionEN || fighter.description,
        thumb: apiPlayer.strThumb || fighter.thumb,
        cutout: apiPlayer.strCutout || fighter.cutout,
        last_synced_at: new Date(),
      },
    });

    console.log(`Synced fighter: ${fighter.name}`);
    return true;
  } catch (error) {
    console.error(`Error syncing fighter ${fighterId}:`, error);
    return false;
  }
}

/**
 * Get fighter events
 * 取得選手的賽事
 */
export async function getFighterEvents(fighterId: string) {
  return prisma.fighterEvent.findMany({
    where: { fighter_id: fighterId },
    include: {
      event: true,
      opponent: true,
    },
    orderBy: {
      event: {
        fight_date: "desc",
      },
    },
  });
}

/**
 * Determine sport type from API player data
 * 從 API 選手數據判定運動類型
 */
function determineSportTypeFromAPI(player: any): SportType | null {
  if (!player) return null;

  const sport = player.strSport?.toLowerCase() || "";
  const team = player.strTeam?.toLowerCase() || "";

  if (sport.includes("boxing") || team.includes("boxing")) {
    return "boxing";
  }
  if (
    sport.includes("ufc") ||
    team.includes("ufc") ||
    team.includes("ultimate fighting")
  ) {
    return "ufc";
  }
  if (
    sport.includes("mma") ||
    team.includes("mma") ||
    sport.includes("mixed martial")
  ) {
    return "mma";
  }

  return null;
}
