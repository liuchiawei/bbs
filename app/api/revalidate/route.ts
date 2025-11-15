import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * On-demand revalidation API route
 * オンデマンド再検証APIルート
 * 
 * Usage:
 * POST /api/revalidate?secret=YOUR_SECRET&tag=hot-posts
 * POST /api/revalidate?secret=YOUR_SECRET&path=/
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    // Secret tokenを検証
    // Verify secret token
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: "Invalid secret token" },
        { status: 401 }
      );
    }

    // TagまたはPathのいずれかが必要
    // Either tag or path is required
    if (!tag && !path) {
      return NextResponse.json(
        { error: "Either 'tag' or 'path' parameter is required" },
        { status: 400 }
      );
    }

    // Tagを再検証
    // Revalidate tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now(),
      });
    }

    // Pathを再検証
    // Revalidate path
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path,
        now: Date.now(),
      });
    }
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Error revalidating" },
      { status: 500 }
    );
  }
}

