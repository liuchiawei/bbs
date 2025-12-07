"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface FighterAvatarProps {
  /**
   * Fighter thumbnail image URL (strThumb from API)
   * 選手縮圖 URL（來自 API 的 strThumb）
   */
  thumb?: string | null;
  /**
   * Fighter name (for fallback)
   * 選手名字（用於 fallback）
   */
  name: string;
  /**
   * Avatar size
   * Avatar 尺寸
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Additional className
   * 額外的 className
   */
  className?: string;
}

const sizeClasses = {
  sm: "size-12",
  md: "size-16",
  lg: "size-24",
  xl: "size-32",
};

/**
 * Fighter Avatar Component
 * 選手 Avatar 元件
 * 
 * Displays fighter thumbnail image with fallback to initials
 * 顯示選手縮圖，如果沒有圖片則顯示名字首字母
 */
export function FighterAvatar({
  thumb,
  name,
  size = "md",
  className,
}: FighterAvatarProps) {
  // Get initials from name (first letter of each word)
  // 從名字獲取首字母（每個單字的第一個字母）
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        src={thumb || undefined}
        alt={name}
        className="object-cover"
      />
      <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

