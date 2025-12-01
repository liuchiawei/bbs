import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userSelectWithStats } from "@/lib/types/prisma-selects";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { userId },
      select: userSelectWithStats,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

// PATCH endpoint removed - use /api/profile/[userId] instead
