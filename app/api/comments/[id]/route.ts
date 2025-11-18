import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete comment and its replies
    await prisma.comment.deleteMany({
      where: {
        OR: [{ id }, { parentId: id }],
      },
    });

    // If it's a reply, decrement parent comment's replies count
    if (existingComment.parentId) {
      await prisma.comment.update({
        where: { id: existingComment.parentId },
        data: { replies: { decrement: 1 } },
      });
    }

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath(`/posts/${existingComment.postId}`);
    // コメント数が変更されたので、ホームページと熱門貼文のキャッシュを無効化
    // Comment count changed, invalidate home page and hot posts cache
    revalidatePath("/");
    revalidateTag("posts");
    revalidateTag("hot-posts", 'max');

    return NextResponse.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
