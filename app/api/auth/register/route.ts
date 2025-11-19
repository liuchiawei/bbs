import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import type { ProfileVisibilitySettings } from "@/lib/types";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { t } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { userId: validatedData.userId }],
      },
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: t("ALERT_EMAIL_TAKEN") },
          { status: 400 }
        );
      }
      if (existingUser.userId === validatedData.userId) {
        return NextResponse.json(
          { error: t("USER_ID_TAKEN") },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // 預設可見性：所有欄位為public
    // Default visibility: all fields public
    const defaultVisibility: ProfileVisibilitySettings = {
      name: "public",
      nickname: "public",
      gender: "public",
      birthDate: "public",
      avatar: "public",
      height: "public",
      weight: "public",
      description: "public",
      record: "public",
      train_start: "public",
      stance: "public",
      gym: "public",
    };

    // Create user and profile in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          userId: validatedData.userId,
          email: validatedData.email,
          password: hashedPassword,
        },
      });

      // Create profile with default name (using userId) and default visibility
      // PrismaのJson型に変換するため、型アサーションを使用
      // Use type assertion to convert to Prisma Json type
      await tx.profile.create({
        data: {
          userId: validatedData.userId,
          name: validatedData.userId, // 使用userId作為預設name
          visibility: defaultVisibility as any,
        },
      });

      return newUser;
    });

    // Create token
    const token = await createToken({
      id: user.id,
      userId: user.userId,
      email: user.email,
    });

    // Set session
    await setSession(token);

    // Next.js 16のrevalidateTagを使用して特定ユーザーのキャッシュをクリア
    // パフォーマンス優先：特定のユーザーのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidateTag(`user-${user.userId}`, "max");
    revalidateTag(`profile-${user.userId}`, "max");
    // ホームページのキャッシュもクリア
    revalidatePath("/");

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: t("SUCCESS_REGISTERED"),
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
      { error: t("ERROR_FAILED_TO_REGISTER") },
      { status: 500 }
    );
  }
}
