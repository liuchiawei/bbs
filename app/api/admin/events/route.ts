import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllEvents } from "@/lib/services/events";

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
    const limit = parseInt(searchParams.get("limit") || "10");

    // Validate pagination parameters
    // 驗證分頁參數
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const { events, pagination } = await getAllEvents({ page, limit });

    return NextResponse.json({
      data: events,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    
    // 開発環境では詳細なエラーメッセージを返す
    // In development, return detailed error message
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        ...(isDevelopment && error instanceof Error && {
          message: error.message,
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}

