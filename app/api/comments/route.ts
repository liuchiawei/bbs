import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
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

      // If it's a reply, update parent comment's replies count (only count non-deleted replies)
      // 返信の場合、親コメントの返信数を更新（削除されていない返信のみカウント）
      if (validatedData.parentId) {
        const nonDeletedRepliesCount = await tx.comment.count({
          where: {
            parentId: validatedData.parentId,
            deletedAt: null,
          },
        });

        await tx.comment.update({
          where: { id: validatedData.parentId },
          data: { replies: nonDeletedRepliesCount },
        });
      }

      return newComment;
    });

    // データベース操作完了後、キャッシュを無効化して最新データを取得できるようにする
    // パフォーマンス優先：必要なパスのみキャッシュをクリアし、メモリオーバーヘッドを最小限に抑える
    revalidatePath(`/posts/${validatedData.postId}`);
    // コメント数が変更されたので、ホームページと熱門貼文のキャッシュを無効化
    // Comment count changed, invalidate home page and hot posts cache
    revalidatePath("/");
    revalidateTag("posts");
    revalidateTag("hot-posts", 'max');

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
