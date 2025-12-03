import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { FighterListCard } from "@/features/fighter/components/fighter-list-card";
import { FighterFilters } from "@/features/fighter/components/fighter-filters";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { FilterLoading } from "@/components/ui/filter-loading";

/**
 * Fighters Page
 * 選手總覽頁面
 * Server Component with Next.js 16 optimizations:
 * - Supports filtering via URL search params
 * - Pagination support with future infinite scroll conversion framework
 * - Direct Prisma queries for optimal performance
 */
export const metadata: Metadata = {
  title: "Fighters | Combat Sports BBS",
  description: "Browse and search combat sports fighters. View profiles, stats, and fight history.",
  openGraph: {
    title: "Fighters | Combat Sports BBS",
    description: "Browse and search combat sports fighters",
  },
};

interface FightersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sport_type?: string;
    nationality?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

// データ取得関数（キャッシュ付き）
// Data fetching function (with caching)
async function getFighters(params: {
  page?: string;
  limit?: string;
  search?: string;
  sport_type?: string;
  nationality?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  return unstable_cache(
    async () => {
      // パラメータを取得
      // Get parameters
      const page = Math.max(1, parseInt(params.page || "1"));
      const limit = Math.min(50, Math.max(1, parseInt(params.limit || "12")));
      const search = params.search?.trim() || "";
      const sportType = params.sport_type;
      const nationality = params.nationality;
      const sortBy = params.sortBy || "name";
      const sortOrder = params.sortOrder || "asc";

      // バリデーション
      // Validation
      const validSortFields = ["name", "createdAt"];
      const validSortOrders = ["asc", "desc"];

      const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "name";
      const finalSortOrder = validSortOrders.includes(sortOrder)
        ? sortOrder
        : "asc";

      // WHERE 句を構築
      // Build WHERE clause
      const whereClause: any = {};

      // 検索条件（名前）
      // Search condition (name)
      if (search) {
        whereClause.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      // スポーツタイプフィルター
      // Sport type filter
      if (sportType && sportType !== "all") {
        whereClause.sport_type = sportType;
      }

      // 国籍フィルター
      // Nationality filter
      if (nationality && nationality !== "all") {
        whereClause.nationality = {
          contains: nationality,
          mode: "insensitive",
        };
      }

      // ソート条件を構築
      // Build sort condition
      const orderBy: any = {};
      orderBy[finalSortBy] = finalSortOrder;

      // スキップ計算
      // Calculate skip
      const skip = (page - 1) * limit;

      // データ取得とカウントを並列実行
      // Fetch data and count in parallel
      const [fighters, total] = await Promise.all([
        prisma.fighter.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            sport_type: true,
            nationality: true,
            thumb: true,
            cutout: true,
            position: true,
            weight: true,
            createdAt: true,
          },
        }),
        prisma.fighter.count({
          where: whereClause,
        }),
      ]);

      // ページネーション情報を計算
      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return {
        data: fighters,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    },
    [
      `fighters-${params.page}-${params.limit}-${params.search}-${params.sport_type}-${params.nationality}-${params.sortBy}-${params.sortOrder}`,
    ],
    {
      tags: ["fighters"],
      revalidate: 60, // 60秒キャッシュ / 60 seconds cache
    }
  )();
}

export default async function FightersPage({ searchParams }: FightersPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;

  // パラメータを取得
  // Get parameters
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "12");
  const search = params.search || "";
  const sportType = params.sport_type || "all";
  const nationality = params.nationality || "all";
  const sortBy = params.sortBy || "name";
  const sortOrder = params.sortOrder || "asc";

  // データを取得
  // Fetch data
  const result = await getFighters({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sport_type: params.sport_type,
    nationality: params.nationality,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  const fighters = result.data;
  const pagination = result.pagination;

  // ページネーションリンクを生成
  // Generate pagination links
  const createPaginationUrl = (newPage: number) => {
    const newParams = new URLSearchParams();
    if (search) newParams.set("search", search);
    if (sportType !== "all") newParams.set("sport_type", sportType);
    if (nationality !== "all") newParams.set("nationality", nationality);
    if (sortBy !== "name") newParams.set("sortBy", sortBy);
    if (sortOrder !== "asc") newParams.set("sortOrder", sortOrder);
    newParams.set("page", newPage.toString());
    return `/fighter?${newParams.toString()}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fighters</h1>
          <p className="text-muted-foreground">
            Browse and search combat sports fighters
          </p>
        </div>
        {user?.isAdmin && (
          <span className="text-sm text-muted-foreground">Admin Access</span>
        )}
      </div>

      {/* Filters */}
      <Suspense fallback={<FilterLoading variant="with-search" />}>
        <FighterFilters />
      </Suspense>

      {/* Fighters Grid */}
      {fighters && fighters.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {fighters.map((fighter: any) => (
              <FighterListCard key={fighter.id} fighter={fighter} />
            ))}
          </div>

          {/* Pagination */}
          {/* TODO: 未來轉換為無限滾動時，可以：
           * 1. 使用 React Query 或 SWR 進行資料獲取
           * 2. 使用 Intersection Observer API 偵測滾動到底部
           * 3. 將分頁邏輯改為 append 模式而非 replace 模式
           * 4. 保留分頁 API 結構，但改為增量載入
           * 
           * TODO: 未来無限スクロールに変換する際は：
           * 1. React Query または SWR を使用してデータ取得
           * 2. Intersection Observer API を使用してスクロール検出
           * 3. ページネーションロジックを replace モードから append モードに変更
           * 4. ページネーション API 構造を保持しつつ、インクリメンタルロードに変更
           */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  {pagination.page > 1 ? (
                    <PaginationItem>
                      <PaginationPrevious href={createPaginationUrl(pagination.page - 1)} />
                    </PaginationItem>
                  ) : (
                    <PaginationItem>
                      <PaginationPrevious href="#" className="pointer-events-none opacity-50" />
                    </PaginationItem>
                  )}

                  {/* Page Numbers */}
                  {(() => {
                    const items: React.ReactNode[] = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.page;

                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        items.push(
                          <PaginationItem key={i}>
                            <PaginationLink
                              href={createPaginationUrl(i)}
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
                            href={createPaginationUrl(1)}
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
                              href={createPaginationUrl(i)}
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
                            href={createPaginationUrl(totalPages)}
                            isActive={totalPages === currentPage}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    return items;
                  })()}

                  {/* Next Button */}
                  {pagination.page < pagination.totalPages ? (
                    <PaginationItem>
                      <PaginationNext href={createPaginationUrl(pagination.page + 1)} />
                    </PaginationItem>
                  ) : (
                    <PaginationItem>
                      <PaginationNext href="#" className="pointer-events-none opacity-50" />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {fighters.length} of {pagination.total} fighter
            {pagination.total !== 1 ? "s" : ""}
            {pagination.totalPages > 1 && (
              <> (Page {pagination.page} of {pagination.totalPages})</>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <p className="text-lg font-medium">No fighters found</p>
            <p className="text-sm mt-2">
              {search || sportType !== "all" || nationality !== "all"
                ? "Try adjusting your filters to see more fighters."
                : "Check back later for more fighters."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

