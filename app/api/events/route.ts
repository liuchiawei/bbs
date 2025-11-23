import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { createEventWithFights, getEventWithFights } from "@/lib/services/events";
import { revalidateTag, unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";

// Schema for creating an event with fights
// 創建賽事及對戰的驗證 schema
const createEventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"), // 賽事名稱（至少3個字符）
  fight_date: z.string().transform((str) => new Date(str)), // 賽事日期
  sport_type: z.string().optional(), // 運動類型（可選）
  promoter: z.string().optional(), // 推廣單位（可選）
  organization: z.string().optional(), // 聯盟品牌（可選）
  venue: z.string().optional(), // 場地（可選）
  location: z.string().optional(), // 地點（可選）
  description: z.string().optional(), // 賽事簡介（可選）
  poster_url: z.string().url().optional().or(z.literal("")), // 海報URL（可選）
  status: z.enum(["PENDING", "OPEN", "CLOSED", "SETTLED", "CANCELLED"]).optional(), // 狀態（可選）
  fights: z.array(
    z.object({
      fighterId: z.string().min(1, "Fighter ID is required"), // 選手1 ID（必填）
      opponentId: z.string().min(1, "Opponent ID is required"), // 選手2 ID（必填）
      fightType: z.enum(["MAIN", "CO_MAIN", "PRELIMS", "EARLY_PRELIMS"]), // 對戰類型
      fightOrder: z.number().int().positive(), // 對戰順序（正整數）
      weightClass: z.string().optional(), // 量級（可選）
      isBettable: z.boolean().optional(), // 是否可投注（可選，預設true）
    })
  ).min(1, "At least one fight is required"), // 至少需要1場對戰
});

/**
 * GET /api/events
 * Get events with optional filtering and caching
 * 獲取賽事列表，支持可選過濾和快取
 * 
 * Query parameters:
 * - status: Filter by event status
 * - sport_type: Filter by sport type
 * - promoter: Filter by promoter
 * - include_fights: Include fights relation (default: false)
 * - limit: Maximum number of events to return (default: 100)
 * - offset: Number of events to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sportType = searchParams.get("sport_type");
    const promoter = searchParams.get("promoter");
    const includeFights = searchParams.get("include_fights") === "true"; // 是否包含對戰列表
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    
    // 構建查詢條件
    // Build query conditions
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (sportType) {
      whereClause.sport_type = sportType;
    }
    if (promoter) {
      whereClause.promoter = promoter;
    }

    // 構建快取 key（基於查詢參數）
    // Build cache key (based on query parameters)
    const cacheKey = `events-${status || "all"}-${sportType || "all"}-${promoter || "all"}-${includeFights ? "with-fights" : "no-fights"}-${limit}-${offset}`;
    
    // 構建 cache tags
    // Build cache tags
    const cacheTags = ["events"];
    if (status) {
      cacheTags.push(`events-status-${status}`);
    }
    if (sportType) {
      cacheTags.push(`events-sport-${sportType}`);
    }

    // 使用快取優化性能（符合 Next.js 16 規範）
    // Use cache for performance optimization (following Next.js 16 standards)
    const events = await unstable_cache(
      async () => {
        return await prisma.event.findMany({
          where: whereClause,
          orderBy: {
            fight_date: "asc",
          },
          take: limit,
          skip: offset,
          select: {
            // 只選擇必要字段，減少數據傳輸
            // Only select necessary fields to reduce data transfer
            id: true,
            name: true,
            fight_date: true,
            status: true,
            sport_type: true,
            promoter: true,
            organization: true,
            venue: true,
            location: true,
            description: true,
            poster_url: true,
            fights: includeFights
              ? {
                  select: {
                    id: true,
                    fighter_id: true,
                    opponent_id: true,
                    fight_type: true,
                    fight_order: true,
                    weight_class: true,
                    is_bettable: true,
                    status: true,
                    fighter: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                    opponent: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                    _count: {
                      select: {
                        bets: true,
                      },
                    },
                  },
                  orderBy: {
                    fight_order: "asc",
                  },
                }
              : false,
            _count: {
              select: { 
                bets: true, 
                posts: true,
                fights: true,
              },
            },
          },
        });
      },
      [cacheKey],
      {
        tags: cacheTags,
        revalidate: 60, // 60秒重新驗證（用戶瀏覽頻率較高）
      }
    )();

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // Create event with fights using service layer
    // 使用服務層創建賽事及對戰
    const result = await createEventWithFights(
      {
        name: validatedData.name,
        fight_date: validatedData.fight_date,
        sport_type: validatedData.sport_type,
        promoter: validatedData.promoter,
        organization: validatedData.organization,
        venue: validatedData.venue,
        location: validatedData.location,
        description: validatedData.description,
        poster_url: validatedData.poster_url || undefined,
        status: validatedData.status,
      },
      validatedData.fights
    );

    // Create audit log
    // 創建審計日誌
    await prisma.auditLog.create({
      data: {
        adminId: user.userId,
        action_type: "CREATE_EVENT",
        description: `Created event: ${result.event.name} (ID: ${result.event.id}) with ${result.fights.length} fights`,
        ip_address: "system",
      },
    });

    // Update cache (符合 Next.js 16 規範，使用 'max' 參數)
    // 更新快取（符合 Next.js 16 規範，使用 'max' 參數）
    revalidateTag(`event-${result.event.id}`, "max");
    revalidateTag(`event-fights-${result.event.id}`, "max");
    revalidateTag("events", "max");
    revalidateTag("admin-settlable-events", "max"); // 更新管理員可結算事件列表快取
    revalidateTag("admin-events", "max"); // 更新管理員賽事列表快取

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // Zod 驗證錯誤處理
    // Zod validation error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Prisma 錯誤處理（資料庫約束錯誤）
    // Prisma error handling (database constraint errors)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let errorMessage = "Database error occurred";
      let statusCode = 500;

      switch (error.code) {
        case "P2002":
          // 唯一約束違反
          // Unique constraint violation
          const target = (error.meta?.target as string[]) || [];
          if (target.includes("event_id") && target.includes("fight_order")) {
            errorMessage = "Duplicate fight order in event";
          } else {
            errorMessage = `Duplicate entry: ${target.join(", ")}`;
          }
          statusCode = 409; // Conflict
          break;
        case "P2003":
          // 外鍵約束違反
          // Foreign key constraint violation
          errorMessage = "Fighter not found or invalid reference";
          statusCode = 400;
          break;
        case "P2025":
          // 記錄不存在
          // Record not found
          errorMessage = error.meta?.cause as string || "Record not found";
          statusCode = 404;
          break;
        default:
          // 其他 Prisma 錯誤
          // Other Prisma errors
          errorMessage = `Database error: ${error.code}`;
          console.error("Prisma error:", error);
      }

      // 開發環境返回詳細錯誤信息，生產環境返回通用錯誤
      // Development: detailed error, Production: generic error
      const isDevelopment = process.env.NODE_ENV === "development";
      return NextResponse.json(
        {
          error: errorMessage,
          ...(isDevelopment && {
            code: error.code,
            meta: error.meta,
          }),
        },
        { status: statusCode }
      );
    }

    // 業務邏輯錯誤處理（Service 層拋出的錯誤）
    // Business logic error handling (errors thrown from Service layer)
    if (error instanceof Error) {
      const isDevelopment = process.env.NODE_ENV === "development";
      console.error("Error creating event:", error);
      
      // 檢查是否為已知的業務邏輯錯誤
      // Check if it's a known business logic error
      if (error.message.includes("Fighter(s) not found") || 
          error.message.includes("Duplicate fight_order")) {
        return NextResponse.json(
          {
            error: error.message,
            ...(isDevelopment && { stack: error.stack }),
          },
          { status: 400 }
        );
      }

      // 其他錯誤：開發環境返回詳細信息，生產環境返回通用錯誤
      // Other errors: detailed in development, generic in production
      return NextResponse.json(
        {
          error: isDevelopment ? error.message : "Failed to create event",
          ...(isDevelopment && { stack: error.stack }),
        },
        { status: 500 }
      );
    }

    // 未知錯誤
    // Unknown error
    console.error("Unknown error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
