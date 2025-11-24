/**
 * Audit Log Service
 * 審計日誌服務層
 * Unified audit logging service for admin actions
 */

import { prisma } from "@/lib/db";

/**
 * Get client IP address from request headers
 * 從請求標頭獲取客戶端 IP 地址
 */
export function getClientIpAddress(
  forwardedFor: string | null,
  realIp: string | null
): string {
  if (forwardedFor) {
    // x-forwarded-for 可能包含多個 IP，取第一個
    // x-forwarded-for may contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

/**
 * Create audit log entry
 * 創建審計日誌條目
 */
export async function createAuditLog(
  adminId: string,
  actionType: string,
  description: string,
  ipAddress: string = "unknown"
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId,
        action_type: actionType,
        description,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    // 審計日誌失敗不應該中斷主要操作，但應該記錄錯誤
    // Audit log failure should not interrupt main operation, but should log error
    console.error("Failed to create audit log:", error);
    // 可以選擇拋出錯誤或僅記錄
    // Optionally throw error or just log
  }
}

/**
 * Get audit logs with pagination
 * 獲取審計日誌（分頁）
 */
export async function getAuditLogs(options: {
  page?: number;
  limit?: number;
  adminId?: string;
  actionType?: string;
} = {}) {
  const { page = 1, limit = 50, adminId, actionType } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (adminId) {
    where.adminId = adminId;
  }
  if (actionType) {
    where.action_type = actionType;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

