import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// ユーザーデータを取得する関数（キャッシュ用）
async function getUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userId: true,
      name: true,
      nickname: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
      isAdmin: true,
      isBanned: true,
      points: true,
      createdAt: true,
      updatedAt: true,
    },
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

    const user = await getCachedUser(session.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
