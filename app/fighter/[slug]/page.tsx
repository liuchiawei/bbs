import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { getFighterBySlug } from "@/lib/services/fighters";
import { FighterProfileCard } from "@/components/fighters/fighter-profile-card";
import { FighterEventHistory } from "@/components/fighters/fighter-event-history";
import { toFighterPublic } from "@/lib/utils/fighter";
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

  // Get fighter data (with caching)
  // 取得選手數據（含快取）
  const fighter = await getFighterBySlug(slug);

  if (!fighter) {
    notFound();
  }

  // Transform events for component
  // 轉換賽事數據供組件使用
  const events = fighter.eventsAsFighter.map((fe) => ({
    id: fe.id,
    result: fe.result,
    method: fe.method,
    round: fe.round,
    time: fe.time,
    weight_class: fe.weight_class,
    event: {
      id: fe.event.id,
      name: fe.event.name,
      fight_date: fe.event.fight_date,
      status: fe.event.status,
      sport_type: fe.event.sport_type,
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
  const fighterData = toFighterPublic(fighter);

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
