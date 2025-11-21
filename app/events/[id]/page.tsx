import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FightBettingCard } from "@/components/betting/FightBettingCard";
import { getEventWithFights } from "@/lib/services/events";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  MapPin,
  Users,
  Activity,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { EventDetailCard } from "@/components/events/event-detail-card";
import { EventFightCard } from "@/components/events/event-fight-card";
import type { Event, ExternalEventSource } from "@/lib/types";

/**
 * Event Detail Page
 * イベント詳細ページ
 * Server Component with Next.js 16 optimizations:
 * - Uses unstable_cache for data fetching
 * - Displays external API data
 * - Dynamic metadata generation
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      name: true,
      fight_date: true,
      sport_type: true,
      status: true,
    },
  });

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: `${event.name} | Combat Sports Events`,
    description: `${event.sport_type?.toUpperCase()} event on ${new Date(
      event.fight_date
    ).toLocaleDateString()}. Status: ${event.status}`,
    openGraph: {
      title: event.name,
      description: `Combat sports event on ${new Date(
        event.fight_date
      ).toLocaleDateString()}`,
      type: "website",
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  // イベントデータを取得（キャッシュ付き、包含對戰列表）
  // Get event data (with caching, including fights)
  const event = await unstable_cache(
    async () => {
      return getEventWithFights(id);
    },
    [`event-with-fights-${id}`],
    {
      tags: ["events", `event-${id}`, `event-fights-${id}`],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();

  if (!event) {
    notFound();
  }

  // Type assertion for event with fights
  // 類型斷言：包含對戰列表的賽事
  const eventWithFights = event as any;

  // 外部APIデータを取得
  // Get external API data
  const externalData = event.external_data as Record<string, unknown> | null;

  // 日付フォーマット
  // Format dates
  const fightDate = new Date(event.fight_date);
  const formattedDate = fightDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = fightDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors = {
    PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    OPEN: "bg-green-500/20 text-green-500 border-green-500/50",
    CLOSED: "bg-red-500/20 text-red-500 border-red-500/50",
    SETTLED: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    CANCELLED: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  const sportTypeColors: Record<string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className={`${statusColors[event.status]} border font-bold`}
            >
              {event.status}
            </Badge>
            {event.sport_type && (
              <Badge
                variant="outline"
                className={`${
                  sportTypeColors[event.sport_type] || sportTypeColors.other
                } border capitalize`}
              >
                {event.sport_type}
              </Badge>
            )}
            {event.external_source && (
              <Badge variant="outline" className="gap-1">
                <ExternalLink className="w-3 h-3" />
                {event.external_source}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Event Detail Card with Rich Data */}
        <div className="mb-8">
          <EventDetailCard
            event={
              {
                ...event,
                external_source:
                  (event.external_source as ExternalEventSource) || null,
              } as Event & { external_data?: Record<string, unknown> | null }
            }
          />
        </div>

        {/* Fights Section */}
        {eventWithFights.fighterEvents && eventWithFights.fighterEvents.length > 0 ? (
          <div className="mb-8 space-y-6">
            <h2 className="text-2xl font-bold">對戰列表 / Fight Card</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {eventWithFights.fighterEvents.map((fight: any) => {
                // 只顯示每個對戰一次（使用 fighter_id 和 fight_order 組合）
                // Only show each fight once (using fighter_id and fight_order combination)
                if (!fight.opponent_id || !fight.opponent) return null;
                
                // 只顯示 fighter_id 較小的記錄（避免重複顯示）
                // Only show records where fighter_id is smaller (avoid duplicate display)
                const otherFight = eventWithFights.fighterEvents.find(
                  (f: any) =>
                    f.fight_order === fight.fight_order &&
                    f.fighter_id === fight.opponent_id &&
                    f.opponent_id === fight.fighter_id
                );
                
                if (otherFight && fight.fighter_id > fight.opponent_id) {
                  return null;
                }

                return (
                  <FightBettingCard
                    key={fight.id}
                    fight={{
                      id: fight.id,
                      fighter: fight.fighter,
                      opponent: fight.opponent,
                      fightType: fight.fight_type,
                      fightOrder: fight.fight_order,
                      weightClass: fight.weight_class,
                      isBettable: fight.is_bettable,
                      status: fight.status,
                      result: fight.result,
                      method: fight.method,
                      round: fight.round,
                      time: fight.time,
                      _count: fight._count,
                    }}
                    userPoints={user ? Number(user.virtual_score) : 0}
                    eventStatus={event.status}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            {user ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium mb-2">尚未有對戰資訊 / No fights yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        此賽事尚未添加對戰組合
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium mb-2">Join the Action</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Login to place bets and join discussions
                      </p>
                      <Link
                        href="/login"
                        className="text-sm text-primary hover:underline"
                      >
                        Login →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
            {/* Fight Card */}
            {externalData?.strResult &&
            typeof externalData.strResult === "string" ? (
              <EventFightCard
                fightCardText={externalData.strResult}
                eventName={event.name}
              />
            ) : null}

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Event Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bets</p>
                    <p className="text-2xl font-bold">{eventWithFights._count?.bets || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fights</p>
                    <p className="text-2xl font-bold">
                      {eventWithFights.fighterEvents?.length || 0}
                    </p>
                  </div>
                </div>

                {event.last_synced_at && (
                  <div className="pt-4 border-t text-xs text-muted-foreground">
                    Last synced:{" "}
                    {new Date(event.last_synced_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Discussions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Discussion
                  </CardTitle>
                  <Link
                    href={`/posts/new?eventId=${event.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Create Post
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {(eventWithFights._count?.posts || 0) > 0 ? (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      {eventWithFights._count?.posts || 0} related discussion
                      {(eventWithFights._count?.posts || 0) !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href={`/posts?eventId=${event.id}`}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View all discussions
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No discussions yet</p>
                    <Link
                      href={`/posts/new?eventId=${event.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Start the first discussion
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
