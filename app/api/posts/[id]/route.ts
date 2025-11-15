import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updatePostSchema, commentIncludeBasic } from "@/lib/validations";
import { userSelectPublicExtended } from "@/lib/validations";
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

    const post = await prisma.post.update({
      where: { id },
      data: validatedData,
      include: {
        user: { select: userSelectPublicExtended },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "desc" },
          include: commentIncludeBasic,
        },
        _count: { select: { comments: true } },
      },
    });

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath("/");
    revalidatePath(`/user/${existingPost.userId}/posts`);
    revalidatePath(`/posts/${id}`);
    // 貼文更新時，熱門貼文のキャッシュも無効化
    // When post is updated, also invalidate hot posts cache
    revalidateTag("hot-posts", 'max');

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

    await prisma.post.delete({
      where: { id },
    });

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath("/");
    revalidatePath(`/user/${existingPost.userId}/posts`);
    revalidatePath(`/posts/${id}`);
    // 貼文削除時，熱門貼文のキャッシュも無効化
    // When post is deleted, also invalidate hot posts cache
    revalidateTag("hot-posts", 'max');

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
