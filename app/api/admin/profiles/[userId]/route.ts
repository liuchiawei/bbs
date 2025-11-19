import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile, restoreProfile } from "@/lib/services/profiles";
import { updateProfileSchema } from "@/lib/validations";
import { z } from "zod";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
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

