import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updatePostSchema, commentIncludeBasic, categorySelect } from "@/lib/validations";
import { userSelectPublicExtended } from "@/lib/validations";
import { softDeletePost, updatePost } from "@/lib/services/posts";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Combine view increment and fetch in single query
    const post = await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        user: { select: userSelectPublicExtended },
        category: {
          select: categorySelect,
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: commentIncludeBasic,
        },
        _count: { select: { comments: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 削除されたカテゴリの場合はnullに設定 / Set category to null if deleted
    if (post.category?.deletedAt) {
      post.category = null;
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { error: "Failed to get post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user owns the post - only select userId
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (existingPost.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    const post = await updatePost(id, {
      title: validatedData.title,
      content: validatedData.content,
      tags: validatedData.tags,
      categoryId: validatedData.categoryId,
      eventId: validatedData.eventId,
    });

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath("/");
    revalidatePath(`/user/${existingPost.userId}/posts`);
    revalidatePath(`/posts/${id}`);
    // 貼文更新時、すべての関連キャッシュを無効化
    // When post is updated, invalidate all related caches
    revalidateTag("posts", 'max'); // 投稿リストのキャッシュを無効化 / Invalidate posts list cache
    revalidateTag("hot-posts", 'max'); // 熱門貼文のキャッシュも無効化 / Also invalidate hot posts cache
    revalidateTag("categories", "max"); // カテゴリキャッシュも無効化 / Also invalidate categories cache

    return NextResponse.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

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

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { userId: true, deletedAt: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 既に削除されているかチェック
    // Check if already deleted
    if (existingPost.deletedAt) {
      return NextResponse.json(
        { error: "Post already deleted" },
        { status: 400 }
      );
    }

    if (existingPost.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ソフトデリートを実行
    // Perform soft delete
    await softDeletePost(id);

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath("/");
    revalidatePath(`/user/${existingPost.userId}/posts`);
    revalidatePath(`/posts/${id}`);
    // 貼文削除時、すべての関連キャッシュを無効化
    // When post is deleted, invalidate all related caches
    revalidateTag("posts", 'max'); // 投稿リストのキャッシュを無効化 / Invalidate posts list cache
    revalidateTag('hot-posts', 'max'); // 熱門貼文のキャッシュも無効化 / Also invalidate hot posts cache

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
