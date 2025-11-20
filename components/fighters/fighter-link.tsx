"use client";

import Link from "next/link";
import { generateSlug } from "@/lib/utils/slug";
import { cn } from "@/lib/utils";

interface FighterLinkProps {
  name: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Fighter Link Component
 * 選手連結組件
 * Displays fighter name as a clickable link
 * Falls back to plain text if slug generation fails
 */
export function FighterLink({
  name,
  className,
  onClick,
}: FighterLinkProps) {
  if (!name || name.trim().length === 0) {
    return <span className={className}>Unknown Fighter</span>;
  }

  const slug = generateSlug(name);

  // If slug generation fails (empty string), show plain text
  // 如果 slug 生成失敗（空字串），顯示純文字
  if (!slug) {
    return (
      <span className={cn("font-semibold", className)}>
        {name}
      </span>
    );
  }

  return (
    <Link
      href={`/fighter/${slug}`}
      className={cn(
        "font-semibold text-primary hover:underline transition-colors",
        className
      )}
      onClick={onClick}
    >
      {name}
    </Link>
  );
}

