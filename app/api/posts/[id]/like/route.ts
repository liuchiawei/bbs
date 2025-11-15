import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

/**
 * ユーザーが投稿にいいねをしているかチェックする関数
 * Check if user has liked the post
 */
async function getPostIsLiked(
  tx: Prisma.TransactionClient,
  userId: string,
  postId: string
): Promise<boolean> {
  const existingLike = await tx.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
    select: { id: true },
  });

  return !!existingLike;
}

/**
 * 投稿のいいね数を取得する関数
 * Get the likes count of a post
 */
async function getPostLikes(
  tx: Prisma.TransactionClient,
  postId: string
): Promise<number> {
  const post = await tx.post.findUnique({
    where: { id: postId },
    select: { likes: true },
  });

  return post?.likes ?? 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const isLiked = await getPostIsLiked(prisma, session.userId, id);
    const likes = await getPostLikes(prisma, id);

    return NextResponse.json({ isLiked, likes });
  } catch (error) {
    console.error("Get like status error:", error);
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Use transaction to ensure atomicity and prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // ユーザーが既にいいねをしているかチェック
      // Check if user already liked this post
      const existingLike = await tx.postLike.findUnique({
        where: {
          userId_postId: {
            userId: session.userId,
            postId: id,
          },
        },
        select: { id: true },
      });

      const isLiked = !!existingLike;

      if (isLiked) {
        // Unlike: remove the like and decrement the count
        await tx.postLike.delete({
          where: { id: existingLike!.id },
        });

        const post = await tx.post.update({
          where: { id },
          data: { likes: { decrement: 1 } },
          select: { likes: true },
        });

        return { likes: post.likes, isLiked: false };
      } else {
        // Like: create the like and increment the count
        await tx.postLike.create({
          data: {
            userId: session.userId,
            postId: id,
          },
        });

        const post = await tx.post.update({
          where: { id },
          data: { likes: { increment: 1 } },
          select: { likes: true },
        });

        return { likes: post.likes, isLiked: true };
      }
    });

    // いいね数が変更されたので、熱門貼文のキャッシュを無効化
    // Like count changed, invalidate hot posts cache
    revalidateTag("hot-posts");

    return NextResponse.json({
      message: result.isLiked
        ? "Post liked successfully"
        : "Post unliked successfully",
      likes: result.likes,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
