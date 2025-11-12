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

    // Check if user already liked this post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.userId,
          postId: id,
        },
      },
    });

    let isLiked: boolean;
    let post;

    if (existingLike) {
      // Unlike: remove the like and decrement the count
      await prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      post = await prisma.post.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });

      isLiked = false;
    } else {
      // Like: create the like and increment the count
      await prisma.postLike.create({
        data: {
          userId: session.userId,
          postId: id,
        },
      });

      post = await prisma.post.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      isLiked = true;
    }

    return NextResponse.json({
      message: isLiked ? "Post liked successfully" : "Post unliked successfully",
      likes: post.likes,
      isLiked,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
