import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getProfileByUserIdForOwner,
  updateVisibility,
} from "@/lib/services/profiles";
import { updateVisibilitySchema } from "@/lib/validations";
import { z } from "zod";
import { revalidateTag } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // 僅自己可見
    // Only self can see
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await getProfileByUserIdForOwner(userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ visibility: profile.visibility });
  } catch (error) {
    console.error("Get visibility error:", error);
    return NextResponse.json(
      { error: "Failed to get visibility" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // 僅能更新自己的可見性設定
    // Only can update own visibility
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateVisibilitySchema.parse(body);

    const profile = await updateVisibility(userId, validatedData.visibility);

    // 清除快取
    // Clear cache
    revalidateTag(`profile-${userId}`, 'max');
    revalidateTag(`user-${userId}`, 'max');

    return NextResponse.json({
      message: "Visibility updated successfully",
      visibility: profile.visibility,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Update visibility error:", error);
    return NextResponse.json(
      { error: "Failed to update visibility" },
      { status: 500 }
    );
  }
}

