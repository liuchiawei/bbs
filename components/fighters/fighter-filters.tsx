"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";
import type { SportType } from "@/lib/types";

/**
 * Fighter Filters Component
 * 選手篩選組件
 * Client component for filtering fighters by search, sport type, nationality, and sorting
 * 用於按搜索、運動類型、國籍和排序篩選選手的客戶端組件
 */
export function FighterFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  // 検索入力のローカル状態
  // Local state for search input
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  // URL パラメータが変更されたときに検索入力を更新
  // Update search input when URL params change
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  // 現在のフィルター値を取得
  // Get current filter values
  const currentSportType = searchParams.get("sport_type") || "all";
  const currentNationality = searchParams.get("nationality") || "all";
  const currentSortBy = searchParams.get("sortBy") || "name";
  const currentSortOrder = searchParams.get("sortOrder") || "asc";

  // フィルターを更新
  // Update filters
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // ページをリセット
    // Reset page
    params.delete("page");

    startTransition(() => {
      router.push(`/fighter?${params.toString()}`);
    });
  };

  // 検索を実行
  // Execute search
  const handleSearch = (value: string) => {
    updateFilter("search", value);
  };

  // 検索入力の変更を処理（デバウンスなし、即座に更新）
  // Handle search input change (no debounce, update immediately)
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    handleSearch(value);
  };

  // すべてのフィルターをクリア
  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/fighter");
    });
  };

  // アクティブなフィルターの数をカウント
  // Count active filters
  const activeFiltersCount =
    (currentSportType !== "all" ? 1 : 0) +
    (currentNationality !== "all" ? 1 : 0) +
    (searchInput ? 1 : 0);

  return (
    <div className="space-y-4 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="搜索選手名稱 / Search fighter name..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isPending}
          className="pl-9"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Filters:
          </span>
        </div>

        {/* Sport Type Filter */}
        <Select
          value={currentSportType}
          onValueChange={(value) => updateFilter("sport_type", value)}
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

        {/* Nationality Filter */}
        <Select
          value={currentNationality}
          onValueChange={(value) => updateFilter("nationality", value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nationalities</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="Brazil">Brazil</SelectItem>
            <SelectItem value="Ireland">Ireland</SelectItem>
            <SelectItem value="Russia">Russia</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Mexico">Mexico</SelectItem>
            <SelectItem value="Japan">Japan</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={currentSortBy}
          onValueChange={(value) => updateFilter("sortBy", value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Date Added</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={currentSortOrder}
          onValueChange={(value) => updateFilter("sortOrder", value)}
          disabled={isPending}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
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
    </div>
  );
}



