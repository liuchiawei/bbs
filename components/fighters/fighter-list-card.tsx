"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { FighterAvatar } from "@/components/fighters/fighter-avatar";
import { cn } from "@/lib/utils";

interface FighterListCardProps {
  fighter: {
    id: string;
    name: string;
    slug: string;
    sport_type?: string | null;
    nationality?: string | null;
    thumb?: string | null;
    cutout?: string | null;
    position?: string | null;
    weight?: string | null;
  };
}

/**
 * Fighter List Card Component
 * 選手列表卡片組件
 * Displays fighter information in a compact card format for list/grid views
 * 以緊湊的卡片格式顯示選手資訊，用於列表/網格視圖
 */
export function FighterListCard({ fighter }: FighterListCardProps) {
  const sportTypeColors: Record<string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  return (
    <Link href={`/fighter/${fighter.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Fighter Avatar */}
            <FighterAvatar
              thumb={fighter.cutout || fighter.thumb}
              name={fighter.name}
              size="lg"
              className="group-hover:ring-2 group-hover:ring-primary transition-all"
            />

            {/* Fighter Name */}
            <div className="w-full">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {fighter.name}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {fighter.sport_type && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs capitalize",
                    sportTypeColors[fighter.sport_type] ||
                      sportTypeColors.other
                  )}
                >
                  {fighter.sport_type}
                </Badge>
              )}
              {fighter.position && (
                <Badge variant="outline" className="text-xs">
                  {fighter.position}
                </Badge>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground w-full">
              {fighter.nationality && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{fighter.nationality}</span>
                </div>
              )}
              {fighter.weight && (
                <div className="text-xs">{fighter.weight}</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

