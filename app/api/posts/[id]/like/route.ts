import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

      let isLiked: boolean;
      let post;

      if (existingLike) {
        // Unlike: remove the like and decrement the count
        await tx.postLike.delete({
          where: { id: existingLike.id },
        });

        post = await tx.post.update({
          where: { id },
          data: { likes: { decrement: 1 } },
          select: { likes: true },
        });

        isLiked = false;
      } else {
        // Like: create the like and increment the count
        await tx.postLike.create({
          data: {
            userId: session.userId,
            postId: id,
          },
        });

        post = await tx.post.update({
          where: { id },
          data: { likes: { increment: 1 } },
          select: { likes: true },
        });

        isLiked = true;
      }

      return { likes: post.likes, isLiked };
    });

    return NextResponse.json({
      message: result.isLiked ? "Post liked successfully" : "Post unliked successfully",
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
