import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { getFighterBySlug } from "@/lib/services/fighters";
import { FighterProfileCard } from "@/components/fighters/fighter-profile-card";
import { FighterEventHistory } from "@/components/fighters/fighter-event-history";
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

  const eventCount = fighter.eventsAsFighter.length;
  const winCount = fighter.eventsAsFighter.filter((e) =>
    e.result?.toLowerCase().includes("win")
  ).length;
  const lossCount = fighter.eventsAsFighter.filter((e) =>
    e.result?.toLowerCase().includes("loss")
  ).length;

  return {
    title: `${fighter.name} | Fighter Profile`,
    description: `${
      fighter.name
    } - ${fighter.sport_type?.toUpperCase()} fighter. Record: ${winCount}-${lossCount}-${
      eventCount - winCount - lossCount
    } (${eventCount} fights)`,
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

  // Transform events for component
  // 轉換賽事數據供組件使用
  const events = fighter.eventsAsFighter.map((fe) => ({
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
    weight: fighter.weight ?? null,
    position: fighter.position ?? null,
    description: fighter.description ?? null,
    thumb: fighter.thumb ?? null,
    cutout: fighter.cutout ?? null,
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
        <FighterEventHistory events={events} />
      </div>
    </div>
  );
}
