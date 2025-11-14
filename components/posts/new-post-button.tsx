import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { t } from "@/lib/constants";

export default function NewPostButton({
  size = "icon-lg",
}: {
  size?: "sm" | "default" | "lg" | "icon" | "icon-sm" | "icon-lg";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size={size}
          asChild
          className={
            size === "icon-lg"
              ? "hover:scale-110 transition-transform duration-200"
              : ""
          }
        >
          <Link href="/posts/new">
            {(size === "lg" || size === "sm" || size === "default") &&
              t("POST")}
            {(size === "icon" || size === "icon-sm" || size === "icon-lg") && (
              <Plus className="size-4" strokeWidth={2.5} />
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("NEW_POST")}</TooltipContent>
    </Tooltip>
  );
}
