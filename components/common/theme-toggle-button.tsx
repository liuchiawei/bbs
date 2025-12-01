"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { t } from "@/lib/constants";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn("hover:text-foreground", className)}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
    </TooltipTrigger>
    <TooltipContent>
      {theme === "dark" ? t("LIGHT_MODE") : t("DARK_MODE")}
    </TooltipContent>
    </Tooltip>
  );
}
