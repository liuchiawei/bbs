import { prisma } from "@/lib/db";
import type { PostWithUser } from "@/lib/types";

export interface GetPostsOptions {
  category?: string;
  userId?: string;
  limit?: number;
  page?: number;
}

/**
 * Get posts with optional filtering
 */
export async function getPosts(
  options: GetPostsOptions = {}
): Promise<PostWithUser[]> {
  const { category, userId, limit = 20, page = 1 } = options;

  const where: any = {};
  if (category) where.category = category;
  if (userId) where.userId = userId;

  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return posts as PostWithUser[];
}

/**
 * Get a single post by ID with full details
 */
export async function getPostById(id: string) {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
}

/**
 * Get total count of posts with optional filtering
 */
export async function getPostsCount(
  options: Omit<GetPostsOptions, "limit" | "page"> = {}
): Promise<number> {
  const { category, userId } = options;

  const where: any = {};
  if (category) where.category = category;
  if (userId) where.userId = userId;

  return await prisma.post.count({ where });
}

/**
 * Create a new post
 */
export async function createPost(userId: string, data: { title: string; content: string; category: string; tags: string[] }) {
  return await prisma.post.create({
    data: {
      ...data,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Update a post
 */
export async function updatePost(id: string, data: { title?: string; content?: string; category?: string; tags?: string[] }) {
  return await prisma.post.update({
    where: { id },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Delete a post
 */
export async function deletePost(id: string) {
  return await prisma.post.delete({
    where: { id },
  });
}

/**
 * Increment post views
 */
export async function incrementPostViews(id: string) {
  return await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

/**
 * Increment post likes
 */
export async function incrementPostLikes(id: string) {
  return await prisma.post.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });
}
