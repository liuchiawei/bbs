import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ isLiked: false });
    }

    const { id } = await params;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.userId,
          commentId: id,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ isLiked: !!existingLike });
  } catch (error) {
    console.error("Check comment like error:", error);
    return NextResponse.json({ isLiked: false });
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
      // Check if user has already liked this comment
      const existingLike = await tx.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId: session.userId,
            commentId: id,
          },
        },
        select: { id: true },
      });

      let comment;
      let isLiked: boolean;

      if (existingLike) {
        // Unlike: Remove the like record and decrement count
        await tx.commentLike.delete({
          where: { id: existingLike.id },
        });

        comment = await tx.comment.update({
          where: { id },
          data: { likes: { decrement: 1 } },
          select: { likes: true },
        });

        isLiked = false;
      } else {
        // Like: Create a like record and increment count
        await tx.commentLike.create({
          data: {
            userId: session.userId,
            commentId: id,
          },
        });

        comment = await tx.comment.update({
          where: { id },
          data: { likes: { increment: 1 } },
          select: { likes: true },
        });

        isLiked = true;
      }

      return { likes: comment.likes, isLiked };
    });

    return NextResponse.json({
      message: result.isLiked ? "Comment liked successfully" : "Comment unliked successfully",
      likes: result.likes,
      isLiked: result.isLiked,
    });
  } catch (error) {
    console.error("Like comment error:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}
