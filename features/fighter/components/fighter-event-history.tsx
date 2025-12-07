"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { FighterLink } from "./fighter-link";

interface FighterEventHistoryProps {
  events: Array<{
    id: string;
    result: string | null;
    method: string | null;
    round: number | null;
    time: string | null;
    weight_class: string | null;
    event: {
      id: string;
      name: string;
      fight_date: Date | string;
      status: string;
      sport_type: string | null;
    };
    opponent: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
}

/**
 * Fighter Event History Component
 * 選手賽事歷史組件
 * Displays fighter's past events and fight results
 */
export function FighterEventHistory({ events }: FighterEventHistoryProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fight History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No fight history available
          </p>
        </CardContent>
      </Card>
    );
  }

  const getResultIcon = (result: string | null) => {
    if (!result) return <Minus className="w-4 h-4" />;
    const resultLower = result.toLowerCase();
    if (resultLower.includes("win")) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    if (resultLower.includes("loss")) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getResultColor = (result: string | null) => {
    if (!result) return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    const resultLower = result.toLowerCase();
    if (resultLower.includes("win")) {
      return "bg-green-500/20 text-green-500 border-green-500/50";
    }
    if (resultLower.includes("loss")) {
      return "bg-red-500/20 text-red-500 border-red-500/50";
    }
    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Fight History
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {events.length} fight{events.length !== 1 ? "s" : ""} recorded
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((fighterEvent) => {
          const eventDate = new Date(fighterEvent.event.fight_date);
          const formattedDate = eventDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={fighterEvent.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              {/* Event Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/event/${fighterEvent.event.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {fighterEvent.event.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${getResultColor(fighterEvent.result)} border flex items-center gap-1`}
                >
                  {getResultIcon(fighterEvent.result)}
                  <span className="capitalize">
                    {fighterEvent.result || "Unknown"}
                  </span>
                </Badge>
              </div>

              {/* Opponent */}
              {fighterEvent.opponent && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">vs.</span>
                  <FighterLink name={fighterEvent.opponent.name} />
                </div>
              )}

              {/* Fight Details */}
              {(fighterEvent.method ||
                fighterEvent.round ||
                fighterEvent.time ||
                fighterEvent.weight_class) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {fighterEvent.weight_class && (
                    <Badge variant="outline" className="text-xs">
                      {fighterEvent.weight_class}
                    </Badge>
                  )}
                  {fighterEvent.method && (
                    <span>Method: {fighterEvent.method}</span>
                  )}
                  {fighterEvent.round && (
                    <span>Round {fighterEvent.round}</span>
                  )}
                  {fighterEvent.time && <span>{fighterEvent.time}</span>}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

