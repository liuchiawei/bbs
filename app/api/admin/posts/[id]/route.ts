import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { deletePostAdmin } from "@/lib/services/posts";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // 投稿情報を取得（キャッシュ無効化用）
    // Get post info for cache invalidation
    const post = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    await deletePostAdmin(id);

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    if (post) {
      revalidatePath("/");
      revalidatePath(`/user/${post.userId}/posts`);
      revalidatePath(`/posts/${id}`);
    }
    // 管理員削除時、すべての関連キャッシュを無効化
    // When admin deletes post, invalidate all related caches
    revalidateTag("posts"); // 投稿リストのキャッシュを無効化 / Invalidate posts list cache
    revalidateTag("hot-posts", 'max'); // 熱門貼文のキャッシュも無効化 / Also invalidate hot posts cache

    return NextResponse.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
