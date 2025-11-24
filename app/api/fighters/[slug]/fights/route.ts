import { NextRequest, NextResponse } from "next/server";
import { getFighterFightsPaginated } from "@/lib/services/fighters";
import { prisma } from "@/lib/db";
import type { PaginationResponse, FightWithDetails } from "@/lib/types";

/**
 * GET /api/fighters/[slug]/fights
 * Get fighter fights with pagination
 * 取得選手對戰列表（分頁）
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 驗證參數
    // Validate parameters
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 50" },
        { status: 400 }
      );
    }

    // 從 slug 查詢 fighter ID
    // Query fighter ID from slug
    const fighter = await prisma.fighter.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!fighter) {
      return NextResponse.json(
        { error: "Fighter not found" },
        { status: 404 }
      );
    }

    // 調用分頁查詢函數
    // Call paginated query function
    const result = await getFighterFightsPaginated(fighter.id, {
      page,
      limit,
    });

    // 返回分頁結果
    // Return paginated result
    const response: PaginationResponse<FightWithDetails> = {
      data: result.fights,
      pagination: result.pagination,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching fighter fights:", error);
    
    // 開発環境では詳細なエラーメッセージを返す
    // In development, return detailed error message
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      {
        error: "Failed to fetch fighter fights",
        ...(isDevelopment && error instanceof Error && {
          message: error.message,
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}


