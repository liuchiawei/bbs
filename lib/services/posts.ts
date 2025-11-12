import { prisma } from "@/lib/db";
import type { PostWithUser } from "@/lib/types";

export interface GetPostsOptions {
  categorySlug?: string;
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
  const { categorySlug, userId, limit = 20, page = 1 } = options;

  const where: any = {};
  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }
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
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
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
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
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
  const { categorySlug, userId } = options;

  const where: any = {};
  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }
  if (userId) where.userId = userId;

  return await prisma.post.count({ where });
}

/**
 * Create a new post
 */
export async function createPost(userId: string, data: { title: string; content: string; categoryId: string; tags: string[] }) {
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
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update a post
 */
export async function updatePost(id: string, data: { title?: string; content?: string; categoryId?: string; tags?: string[] }) {
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
      category: {
        select: {
          id: true,
          slug: true,
          name: true,
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

/**
 * Check if a user has liked a post
 */
export async function hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const like = await prisma.postLike.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  return !!like;
}

/**
 * Admin: Get all posts with pagination
 */
export async function getAllPostsAdmin(options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
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
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.post.count(),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Admin: Delete any post
 */
export async function deletePostAdmin(postId: string) {
  return await prisma.post.delete({
    where: { id: postId },
  });
}
