import { NextRequest, NextResponse } from "next/server";
import { getAllCategories } from "@/lib/services/categories";

export async function GET(request: NextRequest) {
  try {
    // 公開API：削除されていないカテゴリのみ返す
    // Public API: Return only non-deleted categories
    const categories = await getAllCategories();

    return NextResponse.json({
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

