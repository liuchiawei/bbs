import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { getFighterBySlug } from "@/lib/services/fighters";
import { FighterProfileCard } from "@/components/fighters/fighter-profile-card";
import { FighterFightHistory } from "@/components/fighters/fighter-fight-history";
import { prisma } from "@/lib/db";
import type { FighterPublic } from "@/lib/types";
import type { Metadata } from "next";

/**
 * Fighter Detail Page
 * 選手詳細頁面
 * Server Component with Next.js 16 optimizations
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // 只從內部資料庫查詢，不使用外部 API
  // Query only from internal database, do not use external API
  const fighter = await getFighterBySlug(slug);

  if (!fighter) {
    return {
      title: "Fighter Not Found",
    };
  }

  // 取得總對戰數和統計（用於 metadata，包含作為fighter和opponent的所有對戰）
  // Get total fight count and statistics (for metadata, includes all fights as fighter and opponent)
  const totalFights = await prisma.fight.count({
    where: {
      OR: [
        { fighter_id: fighter.id },
        { opponent_id: fighter.id },
      ],
    },
  });

  // 取得所有對戰結果用於統計（僅用於 metadata，不影響頁面載入）
  // Get all fight results for statistics (only for metadata, doesn't affect page load)
  const allFights = await prisma.fight.findMany({
    where: {
      OR: [
        { fighter_id: fighter.id },
        { opponent_id: fighter.id },
      ],
    },
    select: {
      fighter_id: true,
      opponent_id: true,
      result: true,
    },
  });

  let winCount = 0;
  let lossCount = 0;

  allFights.forEach((fight) => {
    if (!fight.result) return;
    
    const isFighter = fight.fighter_id === fighter.id;
    const result = fight.result.toLowerCase();
    
    // 結果是從fighter角度記錄的，需要根據角色轉換
    // Result is recorded from fighter's perspective, need to convert based on role
    if (isFighter) {
      if (result.includes("win")) {
        winCount++;
      } else if (result.includes("loss")) {
        lossCount++;
      }
    } else {
      // 選手是opponent，結果需要反轉
      // Fighter is the opponent, need to reverse the result
      if (result.includes("win")) {
        lossCount++; // fighter贏了，opponent輸了
      } else if (result.includes("loss")) {
        winCount++; // fighter輸了，opponent贏了
      }
    }
  });

  return {
    title: `${fighter.name} | Fighter Profile`,
    description: `${
      fighter.name
    } - ${fighter.sport_type?.toUpperCase()} fighter. Record: ${winCount}-${lossCount}-${
      totalFights - winCount - lossCount
    } (${totalFights} fights)`,
    openGraph: {
      title: fighter.name,
      description: `${fighter.sport_type?.toUpperCase()} fighter${
        fighter.nationality ? ` from ${fighter.nationality}` : ""
      }`,
      type: "profile",
      images: fighter.thumb ? [{ url: fighter.thumb }] : undefined,
    },
  };
}

export default async function FighterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 只從內部資料庫查詢選手資料，不使用外部 API
  // Query fighter data only from internal database, do not use external API
  // 外部 API 同步應通過後台任務或 API 端點處理
  // External API sync should be handled via background tasks or API endpoints
  console.log(`[Fighter Page] Fetching fighter with slug: "${slug}"`);
  const fighter = await getFighterBySlug(slug);

  if (!fighter) {
    // Fighter not found in database
    // 資料庫找不到選手
    console.log(
      `[Fighter Page] Fighter not found for slug: "${slug}", returning 404`
    );
    notFound();
  }

  console.log(
    `[Fighter Page] Successfully loaded fighter: ${fighter.name} (slug: ${fighter.slug})`
  );

  // Get total fight count from database (包含作為fighter和opponent的所有對戰)
  // 從資料庫取得總對戰數（包含作為fighter和opponent的所有對戰）
  const totalFights = await prisma.fight.count({
    where: {
      OR: [
        { fighter_id: fighter.id },
        { opponent_id: fighter.id },
      ],
    },
  });

  // Transform initial fights for component (first 10)
  // 轉換初始對戰數據供組件使用（前10場，包含作為fighter和opponent的所有對戰）
  // 注意：fighter.fightsAsFighter 已經由 toFighterWithEvents 合併了 fightsAsFighter 和 fightsAsOpponent
  // 並且已經正確處理了結果反轉和角色交換
  // Note: fighter.fightsAsFighter has already been merged by toFighterWithEvents from both fightsAsFighter and fightsAsOpponent
  // and has already correctly handled result reversal and role swapping
  const initialFights = fighter.fightsAsFighter.map((fe) => ({
    id: fe.id,
    result: fe.result ?? null,
    method: fe.method ?? null,
    round: fe.round ?? null,
    time: fe.time ?? null,
    weight_class: fe.weight_class ?? null,
    event: {
      id: fe.event.id,
      name: fe.event.name,
      fight_date: fe.event.fight_date,
      status: fe.event.status,
      sport_type: fe.event.sport_type ?? null,
    },
    opponent: fe.opponent
      ? {
          id: fe.opponent.id,
          name: fe.opponent.name,
          slug: fe.opponent.slug,
        }
      : null,
  }));

  // Transform fighter data for component using utility function
  // 使用工具函數轉換選手數據供組件使用
  // Note: toFighterPublic expects Prisma Fighter type, but we have FighterWithEvents
  // We need to extract the base fighter data
  // 注意：toFighterPublic 期望 Prisma Fighter 類型，但我們有 FighterWithEvents
  // 我們需要提取基礎 fighter 數據
  const fighterData: FighterPublic = {
    id: fighter.id,
    name: fighter.name,
    slug: fighter.slug,
    nationality: fighter.nationality ?? null,
    date_born: fighter.date_born ?? null,
    height: fighter.height ?? null,
    weight:
      fighter.weight ??
      fighter.fightsAsFighter.find((f) => f.fighter_id === fighter.id)?.weight_class ??
      (fighter.external_data as any)?.strWeight ??
      null,
    position: fighter.position ?? null,
    description: fighter.description ?? null,
    thumb: fighter.thumb ?? (fighter.external_data as any)?.strThumb ?? null,
    cutout: fighter.cutout ?? (fighter.external_data as any)?.strCutout ?? null,
    sport_type: fighter.sport_type ?? null,
    external_data: fighter.external_data ?? null,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Fighter Profile */}
        <div className="mb-8">
          <FighterProfileCard fighter={fighterData} />
        </div>
        {/* Fight History */}
        <FighterFightHistory
          initialFights={initialFights}
          fighterSlug={slug}
          totalFights={totalFights}
        />
      </div>
    </div>
  );
}
