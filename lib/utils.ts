import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserPublicExtended } from "@/lib/types"

/**
 * 將嵌套的profile結構轉換為扁平結構
 * Convert nested profile structure to flat structure
 * 
 * パフォーマンス最適化：統一的な変換関数により、コード重複を削減し、型安全性を向上
 * Performance optimization: Unified transform function reduces code duplication and improves type safety
 */
export function transformUser(user: {
  id: string;
  userId: string;
  email: string;
  profile?: {
    name?: string | null;
    nickname?: string | null;
    avatar?: string | null;
  } | null;
}): UserPublicExtended {
  if (!user.profile) {
    // 如果沒有profile，使用userId作為預設值
    // If no profile, use userId as default
    return {
      id: user.id,
      userId: user.userId,
      email: user.email,
      name: user.userId,
      nickname: null,
      avatar: null,
    };
  }
  
  // 嚴格處理 undefined，確保返回類型為 string | null
  // Strictly handle undefined to ensure return type is string | null
  return {
    id: user.id,
    userId: user.userId,
    email: user.email,
    name: user.profile.name || user.userId,
    nickname: user.profile.nickname ?? null, // 使用 ?? 確保 undefined 轉為 null
    avatar: user.profile.avatar ?? null, // 使用 ?? 確保 undefined 轉為 null
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
