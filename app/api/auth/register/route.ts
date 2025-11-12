import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setSession } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  userId: z.string()
    .min(1, "User ID is required")
    .max(8, "User ID must be 8 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "User ID can only contain English letters and numbers"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { userId: validatedData.userId },
          ...(validatedData.nickname ? [{ nickname: validatedData.nickname }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      if (existingUser.userId === validatedData.userId) {
        return NextResponse.json(
          { error: "User ID is already taken" },
          { status: 400 }
        );
      }
      if (existingUser.nickname === validatedData.nickname) {
        return NextResponse.json(
          { error: "Nickname is already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        userId: validatedData.userId,
        name: validatedData.name,
        nickname: validatedData.nickname || null,
        email: validatedData.email,
        password: hashedPassword,
        gender: validatedData.gender,
        birthDate: validatedData.birthDate
          ? new Date(validatedData.birthDate)
          : null,
      },
    });

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
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
