import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSelectFull } from "@/lib/validations";
import type { ProfileVisibilitySettings } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          ...profileSelectFull,
          user: {
            select: {
              userId: true,
              email: true,
              isAdmin: true,
              isBanned: true,
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return NextResponse.json({
      data: profiles.map((profile) => ({
        ...profile,
        visibility: (profile.visibility as ProfileVisibilitySettings) || {},
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

