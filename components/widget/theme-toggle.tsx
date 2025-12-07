"use client";
import { useState } from "react";
import SliderToggle from "@/components/common/slider-toggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { t } from "@/lib/constants";

export default function ThemeToggle() {
  const [selected, setSelected] = useState<"light" | "dark">("light");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SliderToggle selected={selected} setSelected={setSelected} />
      </TooltipTrigger>
      <TooltipContent>
        {selected === "light" ? t("LIGHT_MODE") : t("DARK_MODE")}
      </TooltipContent>
    </Tooltip>
  );
}
