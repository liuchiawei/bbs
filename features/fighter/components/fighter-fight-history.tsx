"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Calendar, Trophy, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import Link from "next/link";
import { FighterLink } from "./fighter-link";
import type { FightWithDetails } from "@/lib/types";

interface FighterFightHistoryProps {
  initialFights: Array<{
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
  fighterSlug: string;
  totalFights: number;
}

/**
 * Fighter Fight History Component with Pagination
 * 選手對戰歷史組件（支援分頁）
 * Displays fighter's past fights with pagination support
 */
export function FighterFightHistory({
  initialFights,
  fighterSlug,
  totalFights,
}: FighterFightHistoryProps) {
  const [fights, setFights] = useState(initialFights);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: totalFights,
    totalPages: Math.ceil(totalFights / 10),
  });

  useEffect(() => {
    // 第一頁使用初始數據，不需要重新載入
    // First page uses initial data, no need to reload
    if (page === 1) {
      setFights(initialFights);
      return;
    }

    // 載入其他頁面的數據
    // Load data for other pages
    const fetchFights = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/fighters/${fighterSlug}/fights?page=${page}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setFights(data.data || []);
          setPagination(data.pagination);
        } else {
          console.error("Failed to fetch fights");
        }
      } catch (error) {
        console.error("Error fetching fights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFights();
  }, [page, fighterSlug, initialFights]);

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

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.page;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) {
              setPage(currentPage - 1);
            }
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // Page numbers
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(1);
            }}
            isActive={1 === currentPage}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
              isActive={i === currentPage}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(totalPages);
            }}
            isActive={totalPages === currentPage}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
              setPage(currentPage + 1);
            }
          }}
          className={
            currentPage === totalPages ? "pointer-events-none opacity-50" : ""
          }
        />
      </PaginationItem>
    );

    return items;
  };

  if (fights.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Fight History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No fight history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Fight History
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {pagination.total} fight{pagination.total !== 1 ? "s" : ""} recorded
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {fights.map((fight) => {
              const eventDate = new Date(fight.event.fight_date);
              const formattedDate = eventDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={fight.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/event/${fight.event.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {fight.event.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getResultColor(fight.result)} border flex items-center gap-1`}
                    >
                      {getResultIcon(fight.result)}
                      <span className="capitalize">
                        {fight.result || "Unknown"}
                      </span>
                    </Badge>
                  </div>

                  {/* Opponent */}
                  {fight.opponent && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">vs.</span>
                      <FighterLink
                        name={fight.opponent.name}
                        slug={fight.opponent.slug}
                      />
                    </div>
                  )}

                  {/* Fight Details */}
                  {(fight.method ||
                    fight.round ||
                    fight.time ||
                    fight.weight_class) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {fight.weight_class && (
                        <Badge variant="outline" className="text-xs">
                          {fight.weight_class}
                        </Badge>
                      )}
                      {fight.method && (
                        <span>Method: {fight.method}</span>
                      )}
                      {fight.round && (
                        <span>Round {fight.round}</span>
                      )}
                      {fight.time && <span>{fight.time}</span>}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    {renderPaginationItems()}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}



