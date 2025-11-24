"use client";

import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { FighterAvatar } from "@/components/fighters/fighter-avatar";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface FighterProfileHoverCardProps {
  /**
   * Fighter ID
   * 選手ID
   */
  fighterId: string;
  /**
   * Fighter name
   * 選手名字
   */
  fighterName: string;
  /**
   * Fighter slug for link
   * 選手 slug（用於連結）
   */
  fighterSlug?: string;
  /**
   * Fighter thumbnail image URL
   * 選手縮圖 URL
   */
  fighterThumb?: string | null;
  /**
   * Fighter nationality
   * 選手國籍
   */
  fighterNationality?: string | null;
  /**
   * Fighter sport type
   * 選手運動類型
   */
  fighterSportType?: string | null;
  /**
   * Optional: Pre-loaded statistics (to avoid API call)
   * 可選：預載入的統計資料（避免 API 呼叫）
   */
  preloadedStats?: {
    wins: number;
    losses: number;
    draws: number;
    total: number;
  };
  /**
   * Optional: Pre-loaded recent fights
   * 可選：預載入的最近對戰
   */
  preloadedRecentFights?: Array<{
    id: string;
    result: string | null;
    opponent: {
      id: string;
      name: string;
      slug: string;
    } | null;
    event: {
      id: string;
      name: string;
      fight_date: Date | string;
    };
  }>;
  /**
   * Trigger element (if not provided, uses default)
   * 觸發元素（如果未提供，使用預設）
   */
  trigger?: React.ReactNode;
}

/**
 * Fighter Profile Hover Card Component
 * 選手資料懸停卡片組件
 *
 * Displays fighter profile information when hovering over fighter name/avatar
 * 當懸停在選手名字/頭像上時顯示選手資料資訊
 */
export function FighterProfileHoverCard({
  fighterId,
  fighterName,
  fighterSlug,
  fighterThumb,
  fighterNationality,
  fighterSportType,
  preloadedStats,
  preloadedRecentFights,
  trigger,
}: FighterProfileHoverCardProps) {
  const [stats, setStats] = useState(preloadedStats);
  const [recentFights, setRecentFights] = useState(preloadedRecentFights);
  const [loading, setLoading] = useState(
    !preloadedStats || !preloadedRecentFights
  );

  // 如果沒有預載入資料，則從 API 獲取
  // If no preloaded data, fetch from API
  useEffect(() => {
    if (preloadedStats && preloadedRecentFights) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 使用 slug 或 ID 作為查詢參數
        // Use slug or ID as query parameter
        const identifier = fighterSlug || fighterId;
        const [statsRes, fightsRes] = await Promise.all([
          fetch(`/api/fighters/${identifier}/stats`).catch(() => null),
          fetch(`/api/fighters/${identifier}/recent-fights?limit=3`).catch(
            () => null
          ),
        ]);

        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (fightsRes?.ok) {
          const fightsData = await fightsRes.json();
          setRecentFights(fightsData.fights || []);
        }
      } catch (error) {
        console.error("Failed to fetch fighter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fighterId, fighterSlug, preloadedStats, preloadedRecentFights]);

  const sportTypeColors: Record<string, string> = {
    boxing: "bg-red-500/20 text-red-500 border-red-500/50",
    ufc: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    mma: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    other: "bg-gray-500/20 text-gray-500 border-gray-500/50",
  };

  const getResultIcon = (result: string | null) => {
    if (!result) return <Minus className="w-3 h-3 text-muted-foreground" />;
    const resultLower = result.toLowerCase();
    if (resultLower.includes("win")) {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    }
    if (resultLower.includes("loss")) {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    }
    return <Minus className="w-3 h-3 text-yellow-500" />;
  };

  const defaultTrigger = (
    <span className="hover:text-primary transition-colors cursor-pointer">
      {fighterName}
    </span>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={`/fighter/${fighterSlug}`}>
          {trigger || defaultTrigger}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-4">
          {/* Fighter Header */}
          <div className="flex items-start gap-3">
            <FighterAvatar
              thumb={fighterThumb}
              name={fighterName}
              size="md"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {fighterName}
                </h3>
                {fighterSportType && (
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      sportTypeColors[fighterSportType] || sportTypeColors.other
                    }`}
                  >
                    {fighterSportType}
                  </Badge>
                )}
              </div>
              {fighterNationality && (
                <p className="text-xs text-muted-foreground">
                  {fighterNationality}
                </p>
              )}
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Trophy className="w-3 h-3 text-muted-foreground" />
                <span className="font-semibold">戰績 / Record</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold text-green-600">{stats.wins}</div>
                  <div className="text-muted-foreground">勝 / W</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold text-red-600">{stats.losses}</div>
                  <div className="text-muted-foreground">負 / L</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold text-yellow-600">{stats.draws}</div>
                  <div className="text-muted-foreground">平 / D</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-bold">{stats.total}</div>
                  <div className="text-muted-foreground">總 / Total</div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Fights */}
          {recentFights && recentFights.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                最近對戰 / Recent Fights
              </div>
              <div className="space-y-1.5">
                {recentFights.slice(0, 3).map((fight) => (
                  <div
                    key={fight.id}
                    className="flex items-center gap-2 text-xs p-1.5 bg-muted/30 rounded"
                  >
                    {getResultIcon(fight.result)}
                    <span className="flex-1 truncate">
                      {fight.opponent?.name || "TBD"}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(fight.event.fight_date).getFullYear()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-xs text-muted-foreground text-center py-2">
              載入中... / Loading...
            </div>
          )}

          {/* Link to Fighter Page */}
          {fighterSlug && (
            <Link
              href={`/fighter/${fighterSlug}`}
              className="block text-xs text-primary hover:underline text-center pt-2 border-t"
            >
              查看完整資料 / View Full Profile →
            </Link>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
