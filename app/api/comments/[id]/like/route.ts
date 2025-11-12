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
    const userId = session.userId;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
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
    const userId = session.userId;

    // Check if user has already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    });

    let comment;
    let isLiked: boolean;

    if (existingLike) {
      // Unlike: Remove the like record and decrement count
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      comment = await prisma.comment.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });

      isLiked = false;
    } else {
      // Like: Create a like record and increment count
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: id,
        },
      });

      comment = await prisma.comment.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });

      isLiked = true;
    }

    return NextResponse.json({
      message: isLiked ? "Comment liked successfully" : "Comment unliked successfully",
      likes: comment.likes,
      isLiked,
    });
  } catch (error) {
    console.error("Like comment error:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}
