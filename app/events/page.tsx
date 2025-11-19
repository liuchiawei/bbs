import { prisma } from "@/lib/db";
import { EventCard } from "@/components/betting/EventCard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const user = await getCurrentUser();
  
  const events = await prisma.event.findMany({
    orderBy: {
      fight_date: "asc",
    },
    include: {
      _count: {
        select: { bets: true, posts: true },
      },
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Combat Sports Events</h1>
        {user?.isAdmin && (
          // TODO: Add link to create event or admin panel
          <span className="text-sm text-muted-foreground">Admin Access</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event as any} />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events found.
        </div>
      )}
    </div>
  );
}
