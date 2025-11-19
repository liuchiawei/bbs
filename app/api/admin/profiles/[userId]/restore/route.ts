import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { restoreProfile } from "@/lib/services/profiles";
import { revalidateTag } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;

    const profile = await restoreProfile(userId);

    // 清除快取
    // Clear cache
    revalidateTag(`profile-${userId}`);
    revalidateTag(`user-${userId}`);

    return NextResponse.json({
      message: "Profile restored successfully",
      profile,
    });
  } catch (error) {
    console.error("Restore profile error:", error);
    return NextResponse.json(
      { error: "Failed to restore profile" },
      { status: 500 }
    );
  }
}

