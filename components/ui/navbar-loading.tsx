import { Skeleton } from "@/components/ui/skeleton";

/**
 * Navbar Loading Component
 * ナビゲーションバーのローディングコンポーネント
 * 
 * Navbar の構造を模擬したローディング表示
 * Loading display that mimics the Navbar structure
 */
export function NavbarLoading() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 md:px-4 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      {/* 左側：AppSideBar のスケルトン */}
      {/* Left side: AppSideBar skeleton */}
      <div className="flex items-center">
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      
      {/* 中間：アプリケーション名のスケルトン */}
      {/* Center: Application name skeleton */}
      <Skeleton className="h-7 w-32 md:w-40" />
      
      {/* 右側：ユーザーメニューのスケルトン */}
      {/* Right side: User menu skeleton */}
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </nav>
  );
}

