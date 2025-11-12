import { NextRequest, NextResponse } from "next/server";
import { checkUserIdAvailability } from "@/lib/services/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate userId format (alphanumeric, 1-12 characters)
    if (!/^[a-zA-Z0-9]{1,12}$/.test(userId)) {
      return NextResponse.json(
        { available: false, error: "Invalid User ID format" },
        { status: 400 }
      );
    }

    const isAvailable = await checkUserIdAvailability(userId);

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error("Check userId error:", error);
    return NextResponse.json(
      { error: "Failed to check User ID availability" },
      { status: 500 }
    );
  }
}
