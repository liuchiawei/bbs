import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users } from "lucide-react";

interface Event {
  id: string;
  name: string;
  fight_date: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  _count?: {
    bets: number;
    posts: number;
  };
}

export function EventCard({ event }: { event: Event }) {
  const statusColors = {
    PENDING: "bg-yellow-500",
    OPEN: "bg-green-500",
    CLOSED: "bg-red-500",
    SETTLED: "bg-blue-500",
    CANCELLED: "bg-gray-500",
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={`${statusColors[event.status]} text-white border-none`}>
              {event.status}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4 mr-1" />
              {new Date(event.fight_date).toLocaleDateString()}
            </div>
          </div>
          <CardTitle className="mt-2 line-clamp-2">{event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {event._count?.bets || 0} Bets
            </div>
            <div>
              {event._count?.posts || 0} Discussions
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
