import { Skeleton } from "@/components/ui/skeleton";

/**
 * Filter Loading Component
 * フィルターのローディングコンポーネント
 * 
 * Filter コンポーネントの構造を模擬したローディング表示
 * Loading display that mimics the Filter component structure
 */
interface FilterLoadingProps {
  /**
   * フィルターの種類に応じたレイアウト
   * Layout based on filter type
   */
  variant?: "default" | "with-search";
  
  /**
   * カスタムクラス名
   * Custom class names
   */
  className?: string;
}

export function FilterLoading({ variant = "default", className }: FilterLoadingProps) {
  if (variant === "with-search") {
    return (
      <div className={`space-y-4 mb-8 ${className || ""}`}>
        {/* 検索バーのスケルトン */}
        {/* Search bar skeleton */}
        <Skeleton className="h-10 w-full" />
        
        {/* フィルター行のスケルトン */}
        {/* Filter row skeleton */}
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 mb-8 ${className || ""}`}>
      {/* フィルターラベルのスケルトン */}
      {/* Filter label skeleton */}
      <Skeleton className="h-4 w-16" />
      
      {/* フィルターボタン/セレクトのスケルトン */}
      {/* Filter button/select skeleton */}
      <Skeleton className="h-10 w-[140px]" />
      <Skeleton className="h-10 w-[140px]" />
    </div>
  );
}

