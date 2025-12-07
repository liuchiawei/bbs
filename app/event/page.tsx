import { Suspense } from "react";
import { EventCard } from "@/features/betting/components/EventCard";
import { EventFilters } from "@/features/event/components/event-filters";
import { getCurrentUser } from "@/lib/auth";
import { getCombatEvents } from "@/lib/services/events";
import type { SportType } from "@/lib/types";
import type { Event } from "@/lib/types";
import { Metadata } from "next";
import { FilterLoading } from "@/components/ui/filter-loading";

/**
 * Events Page
 * イベントページ
 * Server Component with Next.js 16 optimizations:
 * - Uses unstable_cache for data fetching
 * - Supports filtering via URL search params
 * - Automatic revalidation via cache tags
 */
export const metadata: Metadata = {
  title: "Combat Sports Events | BBS",
  description: "View upcoming boxing, UFC, and MMA events. Place bets and join discussions.",
  openGraph: {
    title: "Combat Sports Events",
    description: "View upcoming boxing, UFC, and MMA events",
  },
};

interface EventsPageProps {
  searchParams: Promise<{
    sport?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  // フィルターパラメータを取得
  // Get filter parameters
  const sportType = (params.sport as SportType | undefined) || "all";
  const status = (params.status as Event["status"] | undefined) || "all";

  // イベントを取得（キャッシュ付き）
  // Get events (with caching)
  const events = await getCombatEvents({
    sportType: sportType === "all" ? undefined : (sportType as SportType),
    status: status === "all" ? undefined : status,
    dateRange: "week", // 今週のイベントのみ / Only this week's events
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Combat Sports Events</h1>
          <p className="text-muted-foreground">
            Discover upcoming boxing, UFC, and MMA events
          </p>
        </div>
        {user?.isAdmin && (
          <span className="text-sm text-muted-foreground">Admin Access</span>
        )}
      </div>

      {/* Filters */}
      <Suspense fallback={<FilterLoading />}>
        <EventFilters />
      </Suspense>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm mt-2">
              {sportType !== "all" || status !== "all"
                ? "Try adjusting your filters to see more events."
                : "Check back later for upcoming events."}
            </p>
          </div>
        </div>
      )}

      {/* Event Count */}
      {events.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
