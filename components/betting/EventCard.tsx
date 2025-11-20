import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Activity, ExternalLink } from "lucide-react";
import type { Event, SportType } from "@/lib/types";

interface EventCardProps {
  event: Event & {
    _count?: {
      bets: number;
      posts: number;
    };
  };
}

/**
 * Event Card Component
 * イベントカードコンポーネント
 * Enhanced with sport type, external source, and additional metadata
 * Uses React Compiler for automatic optimization (Next.js 16)
 */
export function EventCard({ event }: EventCardProps) {
  const statusColors = {
    PENDING: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    OPEN: "bg-green-500/20 text-green-500 border-green-500/50 animate-pulse",
    CLOSED: "bg-red-500/20 text-red-500 border-red-500/50",
    SETTLED: "bg-blue-500/20 text-blue-500 border-blue-500/50",
    CANCELLED: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  const sportTypeColors: Record<SportType | string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group relative overflow-hidden border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 h-full flex flex-col">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${statusColors[event.status]} border font-bold tracking-wider text-xs`}>
                {event.status}
              </Badge>
              {event.sport_type && (
                <Badge variant="outline" className={`${sportTypeColors[event.sport_type] || sportTypeColors.other} border text-xs capitalize`}>
                  {event.sport_type}
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <CalendarDays className="w-3 h-3 mr-1.5" />
                {formatDate(event.fight_date)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(event.fight_date)}
              </div>
            </div>
          </div>
          <CardTitle className="mt-2 text-xl md:text-2xl font-black tracking-tight uppercase italic leading-tight group-hover:text-primary transition-colors">
            {event.name}
          </CardTitle>
          {event.external_source && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <ExternalLink className="w-3 h-3" />
              <span className="capitalize">{event.external_source}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="relative z-10 flex-1 flex flex-col justify-end">
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center font-medium">
              <Users className="w-4 h-4 mr-2 text-primary" />
              <span className="text-foreground">{event._count?.bets || 0}</span>
              <span className="ml-1 opacity-70">Bets</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono opacity-70">
                  {event._count?.posts || 0} DISCUSSIONS
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
