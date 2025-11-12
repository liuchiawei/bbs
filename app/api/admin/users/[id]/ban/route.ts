import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { banUser } from "@/lib/services/users";

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

    // Prevent admins from banning themselves
    if (user.id === id) {
      return NextResponse.json(
        { error: "You cannot ban yourself" },
        { status: 400 }
      );
    }

    const bannedUser = await banUser(id);

    return NextResponse.json({
      message: "User banned successfully",
      data: bannedUser,
    });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Failed to ban user" },
      { status: 500 }
    );
  }
}
