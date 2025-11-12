import { NextRequest, NextResponse } from "next/server";
import { getCategories } from "@/lib/services/categories";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();

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
