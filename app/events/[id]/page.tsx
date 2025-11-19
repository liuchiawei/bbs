import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { BettingCard } from "@/components/betting/BettingCard";
import { calculatePoolOdds } from "@/lib/betting-system";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: { bets: true, posts: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const poolData = await calculatePoolOdds(id);

  // Combine event with pool data
  const eventWithPool = {
    ...event,
    poolData,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Badge className="mb-4" variant={event.status === "OPEN" ? "default" : "secondary"}>
            {event.status}
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <div className="flex items-center justify-center text-muted-foreground">
            <CalendarDays className="w-5 h-5 mr-2" />
            {new Date(event.fight_date).toLocaleDateString()} at {new Date(event.fight_date).toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <p className="text-muted-foreground">
                Total Bets: {event._count.bets}
                <br />
                Total Pool: {poolData.totalPool.toLocaleString()} pts
              </p>
              {/* Placeholder for more event info or fight card details */}
            </div>
            
            {/* Placeholder for Related Discussions */}
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Discussion</h2>
              <p className="text-muted-foreground">
                {event._count.posts} related discussions.
                {/* Link to posts with this eventId */}
              </p>
            </div>
          </div>

          <div className="md:col-span-1">
            {user ? (
              <BettingCard 
                event={eventWithPool as any} 
                userPoints={Number(user.virtual_score)} 
              />
            ) : (
              <div className="bg-muted p-6 rounded-lg text-center">
                <p>Please login to place bets.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
