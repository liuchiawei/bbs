/**
 * Fighters API Route
 * 選手API路由
 * Handles fetching fighters list
 * 處理獲取選手列表
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { createAuditLog, getClientIpAddress } from "@/lib/services/audit";
import { z } from "zod";
import { revalidateTag } from "next/cache";

/**
 * GET /api/fighters
 * Get fighters with pagination, search, filtering, and sorting
 * 獲取選手列表（支援分頁、搜索、篩選、排序）
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12, max: 50)
 * - search: Search by name (case-insensitive)
 * - sport_type: Filter by sport type (boxing, ufc, mma, etc.)
 * - nationality: Filter by nationality
 * - sortBy: Sort field (name, createdAt) (default: name)
 * - sortOrder: Sort order (asc, desc) (default: asc)
 * 
 * Returns: { data: Fighter[], pagination: { page, limit, total, totalPages } }
 * 返回：{ data: Fighter[], pagination: { page, limit, total, totalPages } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // パラメータを取得
    // Get parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const search = searchParams.get("search")?.trim() || "";
    const sportType = searchParams.get("sport_type");
    const nationality = searchParams.get("nationality");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // バリデーション
    // Validation
    const validSortFields = ["name", "createdAt"];
    const validSortOrders = ["asc", "desc"];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "name";
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : "asc";

    // WHERE 句を構築
    // Build WHERE clause
    const whereClause: any = {};

    // 検索条件（名前）
    // Search condition (name)
    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // スポーツタイプフィルター
    // Sport type filter
    if (sportType && sportType !== "all") {
      whereClause.sport_type = sportType;
    }

    // 国籍フィルター
    // Nationality filter
    if (nationality && nationality !== "all") {
      whereClause.nationality = {
        contains: nationality,
        mode: "insensitive",
      };
    }

    // ソート条件を構築
    // Build sort condition
    const orderBy: any = {};
    orderBy[finalSortBy] = finalSortOrder;

    // スキップ計算
    // Calculate skip
    const skip = (page - 1) * limit;

    // データ取得とカウントを並列実行
    // Fetch data and count in parallel
    const [fighters, total] = await Promise.all([
      prisma.fighter.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          sport_type: true,
          nationality: true,
          thumb: true,
          cutout: true,
          position: true,
          weight: true,
          createdAt: true,
        },
      }),
      prisma.fighter.count({
        where: whereClause,
      }),
    ]);

    // ページネーション情報を計算
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: fighters,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching fighters:", error);
    return NextResponse.json(
      { error: "Failed to fetch fighters" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fighters
 * Create a new fighter (Admin only)
 * 創建新選手（僅管理員）
 * 
 * Body:
 * {
 *   name: string (required);
 *   slug?: string (optional, auto-generated if not provided);
 *   sport_type?: "boxing" | "ufc" | "mma" | "muay-thai" | "kickboxing";
 *   nationality?: string;
 *   date_born?: string (ISO date string);
 *   height?: string (cm, e.g., "175");
 *   weight?: string (lb, e.g., "155");
 *   position?: string (Weight class);
 *   description?: string;
 *   thumb?: string (URL);
 *   cutout?: string (URL);
 * }
 */
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

    // 驗證輸入
    // Validate input
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      slug: z.string().optional(),
      sport_type: z.enum(["boxing", "ufc", "mma", "muay-thai", "kickboxing"]).optional(),
      nationality: z.string().optional(),
      date_born: z.string().optional(),
      height: z.string().optional(), // 公分/cm
      weight: z.string().optional(), // 磅/lb
      position: z.string().optional(),
      description: z.string().optional(),
      thumb: z.string().url().optional().or(z.literal("")),
      cutout: z.string().url().optional().or(z.literal("")),
    });

    const validatedData = schema.parse(body);

    // 生成 slug（如果未提供）
    // Generate slug if not provided
    let finalSlug = validatedData.slug;
    if (!finalSlug || finalSlug.trim() === "") {
      const existingSlugs = await prisma.fighter.findMany({
        select: { slug: true },
      });
      const slugList = existingSlugs.map((f) => f.slug);
      finalSlug = generateUniqueSlug(validatedData.name, slugList);
    } else {
      // 檢查 slug 唯一性
      // Check slug uniqueness
      const existing = await prisma.fighter.findUnique({
        where: { slug: finalSlug },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Slug "${finalSlug}" already exists` },
          { status: 400 }
        );
      }
    }

    // 獲取 IP 地址
    // Get IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = getClientIpAddress(forwardedFor, realIp);

    // 創建 Fighter 記錄
    // Create Fighter record
    const fighter = await prisma.fighter.create({
      data: {
        name: validatedData.name.trim(),
        slug: finalSlug,
        sport_type: validatedData.sport_type || null,
        nationality: validatedData.nationality?.trim() || null,
        date_born: validatedData.date_born
          ? new Date(validatedData.date_born)
          : null,
        height: validatedData.height?.trim() || null, // 公分/cm
        weight: validatedData.weight?.trim() || null, // 磅/lb
        position: validatedData.position?.trim() || null,
        description: validatedData.description?.trim() || null,
        thumb: validatedData.thumb?.trim() || null,
        cutout: validatedData.cutout?.trim() || null,
      },
    });

    // 記錄 AuditLog
    // Create Audit Log
    await createAuditLog(
      user.userId,
      "CREATE_FIGHTER",
      `Created fighter: ${fighter.name} (ID: ${fighter.id}, Slug: ${fighter.slug})`,
      ipAddress
    );

    // 更新快取
    // Update cache
    revalidateTag("fighters", "max");

    return NextResponse.json(fighter, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 處理 Prisma unique constraint 錯誤
    // Handle Prisma unique constraint errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    console.error("Error creating fighter:", error);
    return NextResponse.json(
      { error: "Failed to create fighter" },
      { status: 500 }
    );
  }
}

