import { prisma } from "@/lib/db";
import type { CommentWithUser } from "@/lib/types";
import { userSelectPublicExtended } from "@/lib/validations";

/**
 * Get comments for a post
 */
export async function getCommentsByPostId(postId: string): Promise<CommentWithUser[]> {
  "use cache";
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null, // Only get top-level comments
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });

  return comments as CommentWithUser[];
}

/**
 * Get replies for a comment
 */
export async function getCommentReplies(commentId: string): Promise<CommentWithUser[]> {
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

  return replies as CommentWithUser[];
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(id: string) {
  "use cache";
  return await prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
    },
  });
}

/**
 * Create a new comment
 */
export async function createComment(userId: string, data: { content: string; postId: string; parentId?: string }) {
  return await prisma.comment.create({
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
}

/**
 * Delete a comment and its replies
 */
export async function deleteComment(id: string) {
  return await prisma.comment.deleteMany({
    where: {
      OR: [{ id }, { parentId: id }],
    },
  });
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
 * Increment parent comment replies count
 */
export async function incrementCommentReplies(parentId: string) {
  return await prisma.comment.update({
    where: { id: parentId },
    data: { replies: { increment: 1 } },
  });
}

/**
 * Decrement parent comment replies count
 */
export async function decrementCommentReplies(parentId: string) {
  return await prisma.comment.update({
    where: { id: parentId },
    data: { replies: { decrement: 1 } },
  });
}
