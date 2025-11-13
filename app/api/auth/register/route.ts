import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { hashPassword, createToken, setSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";
import { t } from "@/lib/constants";

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
        ],
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
      id: user.id,
      userId: user.userId,
      email: user.email,
    });

    // Set session
    await setSession(token);

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    // Session検証：Navbarコンポーネントが最新のユーザー状態を正しく取得できるようにする
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
