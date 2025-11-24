import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Loading Component
 * ローディングコンポーネント
 * 
 * 汎用的なローディング表示コンポーネント
 * Generic loading display component
 */
interface LoadingProps {
  /**
   * ローディングの種類
   * Loading variant type
   */
  variant?: "spinner" | "skeleton" | "inline" | "fullscreen";
  
  /**
   * サイズ
   * Size
   */
  size?: "sm" | "md" | "lg";
  
  /**
   * テキストラベル
   * Text label
   */
  label?: string;
  
  /**
   * カスタムクラス名
   * Custom class names
   */
  className?: string;
}

/**
 * Spinner Loading Variant
 * スピナー型ローディング
 */
function SpinnerLoading({ size = "md", label, className }: Omit<LoadingProps, "variant">) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <Spinner className={sizeClasses[size]} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

/**
 * Skeleton Loading Variant
 * スケルトン型ローディング
 */
function SkeletonLoading({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/**
 * Inline Loading Variant
 * インライン型ローディング
 */
function InlineLoading({ size = "sm", className }: Omit<LoadingProps, "variant" | "label">) {
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Spinner className={sizeClasses[size]} />
    </div>
  );
}

/**
 * Fullscreen Loading Variant
 * フルスクリーン型ローディング
 */
function FullscreenLoading({ label, className }: Omit<LoadingProps, "variant" | "size">) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen gap-4", className)}>
      <Spinner className="size-8" />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

/**
 * Main Loading Component
 * メインローディングコンポーネント
 */
export function Loading({
  variant = "spinner",
  size = "md",
  label,
  className,
}: LoadingProps) {
  switch (variant) {
    case "spinner":
      return <SpinnerLoading size={size} label={label} className={className} />;
    case "skeleton":
      return <SkeletonLoading className={className} />;
    case "inline":
      return <InlineLoading size={size} className={className} />;
    case "fullscreen":
      return <FullscreenLoading label={label} className={className} />;
    default:
      return <SpinnerLoading size={size} label={label} className={className} />;
  }
}

