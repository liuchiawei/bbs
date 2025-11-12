import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, createToken, setSession } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { userId: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid user ID or password" },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been banned" },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid user ID or password" },
        { status: 401 }
      );
    }

    // Create token
    const token = await createToken({
      userId: user.id,
      email: user.email,
    });

    // Set session
    await setSession(token);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
