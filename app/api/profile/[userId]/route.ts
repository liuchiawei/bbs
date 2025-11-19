import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getProfileByUserId,
  getProfileByUserIdForOwner,
  updateProfile,
  softDeleteProfile,
} from "@/lib/services/profiles";
import { updateProfileSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidateTag } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getSession();

    // 取得Profile（根據session.userId和可見性過濾）
    // Get Profile with visibility filtering
    const profile = await getProfileByUserId(userId, session?.userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
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

    // 檢查是否為自己的Profile
    // Check if updating own profile
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const profile = await updateProfile(userId, validatedData);

    // 清除快取
    // Clear cache
    revalidateTag(`profile-${userId}`, 'max');
    revalidateTag(`user-${userId}`, 'max');

    return NextResponse.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
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

    const { userId } = await params;

    // 檢查是否為自己的Profile
    // Check if deleting own profile
    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await softDeleteProfile(userId);

    // 清除快取
    // Clear cache
    revalidateTag(`profile-${userId}`, 'max');
    revalidateTag(`user-${userId}`, 'max');

    return NextResponse.json({
      message: "Profile deleted successfully",
      profile,
    });
  } catch (error) {
    console.error("Delete profile error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}

