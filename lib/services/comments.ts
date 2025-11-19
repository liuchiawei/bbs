import { prisma } from "@/lib/db";
import type { CommentWithUser } from "@/lib/types";
import { userSelectPublicExtended } from "@/lib/validations";
import { transformUser } from "@/lib/utils";

/**
 * Get comments for a post
 * 削除されたコメントも含めて取得（削除された親コメントの返信を表示するため）
 * Includes deleted comments to display replies to deleted parent comments
 */
export async function getCommentsByPostId(
  postId: string
): Promise<CommentWithUser[]> {
  "use cache";
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null, // Only get top-level comments
      // 削除されたコメントも含める（返信構造を保持するため）
      // Include deleted comments to maintain reply structure
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });

  return comments.map((comment) => ({
    ...comment,
    user: transformUser(comment.user),
  })) as CommentWithUser[];
}

/**
 * Get replies for a comment
 * 削除された返信も含めて取得（返信構造を保持するため）
 * Includes deleted replies to maintain reply structure
 */
export async function getCommentReplies(
  commentId: string
): Promise<CommentWithUser[]> {
  "use cache";
  const replies = await prisma.comment.findMany({
    where: { parentId: commentId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });

  return replies.map((reply) => ({
    ...reply,
    user: transformUser(reply.user),
  })) as CommentWithUser[];
}

/**
 * Get a single comment by ID
 * 削除されたコメントも取得可能（表示のため）
 * Can retrieve deleted comments for display purposes
 */
export async function getCommentById(id: string) {
  "use cache";
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });

  if (!comment) return null;

  return {
    ...comment,
    user: transformUser(comment.user),
  };
}

/**
 * Create a new comment
 */
export async function createComment(
  userId: string,
  data: { content: string; postId: string; parentId?: string }
) {
  const comment = await prisma.comment.create({
    data: {
      ...data,
      userId,
    },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });

  return {
    ...comment,
    user: transformUser(comment.user),
  };
}

/**
 * Soft delete a comment and its replies recursively
 * コメントとその返信を再帰的にソフトデリート
 */
export async function softDeleteComment(id: string) {
  const deletedAt = new Date();

  // 再帰的にすべての子コメントを取得してソフトデリート
  // Recursively get all child comments and soft delete them
  const getAllChildIds = async (parentId: string): Promise<string[]> => {
    const children = await prisma.comment.findMany({
      where: { parentId },
      select: { id: true },
    });

    const childIds = children.map((c) => c.id);
    const allChildIds = [...childIds];

    // 各子コメントの子コメントも再帰的に取得
    // Recursively get children of each child comment
    for (const childId of childIds) {
      const grandChildren = await getAllChildIds(childId);
      allChildIds.push(...grandChildren);
    }

    return allChildIds;
  };

  const childIds = await getAllChildIds(id);
  const allIdsToDelete = [id, ...childIds];

  // すべてのコメントをソフトデリート
  // Soft delete all comments
  await prisma.comment.updateMany({
    where: {
      id: { in: allIdsToDelete },
    },
    data: {
      deletedAt,
    },
  });

  return { deletedCount: allIdsToDelete.length };
}

/**
 * Increment comment likes
 */
export async function incrementCommentLikes(id: string) {
  return await prisma.comment.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });
}

/**
 * Update parent comment replies count (only count non-deleted replies)
 * 親コメントの返信数を更新（削除されていない返信のみカウント）
 */
export async function updateCommentRepliesCount(parentId: string) {
  const nonDeletedRepliesCount = await prisma.comment.count({
    where: {
      parentId,
      deletedAt: null,
    },
  });

  return await prisma.comment.update({
    where: { id: parentId },
    data: { replies: nonDeletedRepliesCount },
  });
}

/**
 * Increment parent comment replies count (deprecated - use updateCommentRepliesCount instead)
 * @deprecated Use updateCommentRepliesCount instead
 */
export async function incrementCommentReplies(parentId: string) {
  return await updateCommentRepliesCount(parentId);
}

/**
 * Decrement parent comment replies count (deprecated - use updateCommentRepliesCount instead)
 * @deprecated Use updateCommentRepliesCount instead
 */
export async function decrementCommentReplies(parentId: string) {
  return await updateCommentRepliesCount(parentId);
}
