import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userSelectPublicExtended } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: userSelectPublicExtended,
        },
      },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Get replies error:", error);
    return NextResponse.json(
      { error: "Failed to get replies" },
      { status: 500 }
    );
  }
}
