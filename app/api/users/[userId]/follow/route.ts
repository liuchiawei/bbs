import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    const { userId: targetUserId } = await params;

    if (!session) {
      return NextResponse.json({ isFollowing: false });
    }

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    if (session.userId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { userId: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create follow
    await prisma.follows.create({
      data: {
        followerId: session.userId,
        followingId: targetUserId,
      },
    });

    return NextResponse.json({ message: "Followed successfully" });
  } catch (error) {
    // Check for unique constraint violation (already following)
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { message: "Already following" },
        { status: 200 }
      );
    }
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: targetUserId,
        },
      },
    });

    return NextResponse.json({ message: "Unfollowed successfully" });
  } catch (error) {
    if ((error as any).code === "P2025") {
      // Record to delete does not exist
      return NextResponse.json(
        { message: "Not following" },
        { status: 200 }
      );
    }
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
