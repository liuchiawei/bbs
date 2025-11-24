"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import type { SportType } from "@/lib/types";

/**
 * Event Filters Component
 * イベントフィルターコンポーネント
 * Client component for filtering events by sport type and status
 * Uses React Compiler for automatic memoization (Next.js 16)
 */
export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 現在のフィルター値を取得
  // Get current filter values
  const currentSportType = searchParams.get("sport") || "all";
  const currentStatus = searchParams.get("status") || "all";

  // フィルターを更新
  // Update filters
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // ページをリセット
    // Reset page
    params.delete("page");

    startTransition(() => {
      router.push(`/event?${params.toString()}`);
    });
  };

  // すべてのフィルターをクリア
  // Clear all filters
  const clearFilters = () => {
    startTransition(() => {
      router.push("/event");
    });
  };

  // アクティブなフィルターの数をカウント
  // Count active filters
  const activeFiltersCount =
    (currentSportType !== "all" ? 1 : 0) + (currentStatus !== "all" ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-8">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      </div>

      {/* Sport Type Filter */}
      <Select
        value={currentSportType}
        onValueChange={(value) => updateFilter("sport", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sport Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sports</SelectItem>
          <SelectItem value="boxing">Boxing</SelectItem>
          <SelectItem value="ufc">UFC</SelectItem>
          <SelectItem value="mma">MMA</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={currentStatus}
        onValueChange={(value) => updateFilter("status", value)}
        disabled={isPending}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
          <SelectItem value="SETTLED">Settled</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Filters Badge */}
      {activeFiltersCount > 0 && (
        <>
          <Badge variant="secondary" className="gap-1">
            {activeFiltersCount} active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
            className="h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </>
      )}

      {isPending && (
        <span className="text-sm text-muted-foreground">Loading...</span>
      )}
    </div>
  );
}

