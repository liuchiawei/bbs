"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/constants";

export default function NewPostButtonXL({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={() => router.push("/posts/new")}
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -10, opacity: 0.9 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", duration: 0.3, stiffness: 180 }}
          className={`size-24 md:size-32 lg:size-36 xl:size-40 rounded-full bg-primary text-background flex items-center justify-center shadow-lg md:shadow-xl cursor-pointer ${cn(
            className
          )}`}
        >
          <Plus className="size-12 md:size-16" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("NEW_POST")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
