import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsers } from "@/lib/services/users";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate pagination parameters
    // 驗證分頁參數
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const { users, pagination } = await getAllUsers({ page, limit });

    return NextResponse.json({
      data: users,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    
    // 開発環境では詳細なエラーメッセージを返す
    // In development, return detailed error message
    const isDevelopment = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        ...(isDevelopment && error instanceof Error && {
          message: error.message,
          stack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}
