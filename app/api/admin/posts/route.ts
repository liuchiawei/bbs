import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllPostsAdmin } from "@/lib/services/posts";

// API ルートを動的レンダリングに強制（prerenderを無効化）
// Force API route to dynamic rendering (disable prerender)
// Note: このルートは getCurrentUser() 内で cookies() を使用するため、自動的に動的になります
// Note: This route automatically becomes dynamic because getCurrentUser() uses cookies() internally

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const { posts, pagination } = await getAllPostsAdmin({ page, limit });

    return NextResponse.json({
      data: posts,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
