import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { userSelectFull } from "@/lib/validations";

// ユーザーデータを取得する関数（キャッシュ用）
async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { userId },
    select: userSelectFull,
  });
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 16のunstable_cacheを使用してキャッシュタグを設定
    // パフォーマンス優先：特定のユーザーのみキャッシュをクリアできるようにする
    const getCachedUser = unstable_cache(
      async (userId: string) => getUserData(userId),
      ["user"],
      {
        tags: [`user-${session.userId}`],
        revalidate: 3600, // 1時間
      }
    );

    const user = await getCachedUser(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 扁平化用戶資料，將 profile 資料合併到頂層
    // Flatten user data, merge profile data to top level
    // 使用 ?? 運算符確保 undefined 轉為 null，符合類型定義
    // Use ?? operator to ensure undefined converts to null, matching type definition
    const userResponse = {
      ...user,
      name: user.profile?.name || user.userId,
      nickname: user.profile?.nickname ?? null,
      avatar: user.profile?.avatar ?? null,
      // 移除嵌套的 profile 對象（前端不需要）
      // Remove nested profile object (frontend doesn't need it)
      profile: undefined,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
