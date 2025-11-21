/**
 * Admin Utilities
 * 管理員工具函數
 * Utility functions for admin operations
 */

import type { AdminUserListItem } from "@/lib/types";

/**
 * Format date for admin list display
 * 格式化日期用於管理員列表顯示
 * 
 * 統一管理員列表的日期格式化邏輯，減少代碼重複
 * Unified date formatting logic for admin lists, reducing code duplication
 * 
 * @param date - Date object, date string, or null/undefined
 * @returns Formatted date string (e.g., "Jan 21, 2025") or "-" if null/undefined
 */
export function formatAdminDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Prisma User with Profile type (from getAllUsers query)
 * Prisma User 與 Profile 類型（來自 getAllUsers 查詢）
 */
type PrismaUserWithProfile = {
  id: string;
  userId: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  points: number;
  createdAt: Date;
  profile: {
    name: string | null;
    nickname: string | null;
    avatar: string | null;
  } | null;
  _count: {
    posts: number;
    comments: number;
  };
};

/**
 * Transform Prisma User with Profile to AdminUserListItem
 * 將 Prisma User（含 Profile）轉換為 AdminUserListItem
 * 
 * この関数は、Prisma クエリ結果を AdminUserListItem 型に変換します。
 * profile が null の場合、userId を name のデフォルト値として使用します。
 * 
 * This function transforms Prisma query results to AdminUserListItem type.
 * If profile is null, uses userId as default value for name.
 * 
 * @param user - Prisma User with profile relation
 * @returns AdminUserListItem with flattened structure
 */
export function transformAdminUserListItem(
  user: PrismaUserWithProfile
): AdminUserListItem {
  return {
    id: user.id,
    userId: user.userId,
    // profile が null の場合、userId をデフォルト値として使用
    // If profile is null, use userId as default value
    name: user.profile?.name || user.userId,
    nickname: user.profile?.nickname ?? null,
    email: user.email,
    avatar: user.profile?.avatar ?? null,
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    _count: user._count,
  };
}

