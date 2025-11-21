import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unbanUser } from "@/lib/services/users";
import { revalidateTag } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const unbannedUser = await unbanUser(id);

    // Clear admin users cache after unbanning
    // 解封後清除管理員用戶快取
    revalidateTag("admin-users", "max");

    return NextResponse.json({
      message: "User unbanned successfully",
      data: unbannedUser,
    });
  } catch (error) {
    console.error("Unban user error:", error);
    return NextResponse.json(
      { error: "Failed to unban user" },
      { status: 500 }
    );
  }
}
