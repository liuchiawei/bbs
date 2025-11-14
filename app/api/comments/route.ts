import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createCommentSchema, commentIncludeBasic } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Use transaction to ensure atomicity
    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content: validatedData.content,
          postId: validatedData.postId,
          userId: session.userId,
          parentId: validatedData.parentId,
        },
        include: commentIncludeBasic,
      });

      // If it's a reply, increment parent comment's replies count
      if (validatedData.parentId) {
        await tx.comment.update({
          where: { id: validatedData.parentId },
          data: { replies: { increment: 1 } },
        });
      }

      return newComment;
    });

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath(`/posts/${validatedData.postId}`);

    return NextResponse.json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
