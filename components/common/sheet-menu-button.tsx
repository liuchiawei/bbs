import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SheetMenuButtonProps } from "@/lib/types";

export default function SheetMenuButton({
  icon,
  children,
  className,
  onClick,
}: SheetMenuButtonProps) {
  // アイコンの処理：app-sidebarと同様にコンポーネントとして扱う
  // Handle icon the same way as app-sidebar: treat it as a component
  const Icon = icon;
  return (
    <Button
      variant="ghost"
      className={cn(
        "group w-full justify-start py-8 gap-4 rounded-none",
        className
      )}
      onClick={onClick}
    >
      <Icon />
      <span>{children}</span>
    </Button>
  );
}
