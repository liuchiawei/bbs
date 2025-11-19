import { prisma } from "@/lib/db";
import type { PostWithUser } from "@/lib/types";
import { unstable_cache } from "next/cache";
import { userSelectPublicExtended, categorySelect } from "@/lib/validations";

export interface GetPostsOptions {
  userId?: string;
  limit?: number;
  page?: number;
}

/**
 * Get posts with optional filtering
 * unstable_cacheを使用してISRを実装
 * Use unstable_cache to implement ISR
 */
export async function getPosts(
  options: GetPostsOptions = {}
): Promise<PostWithUser[]> {
  const { userId, limit = 20, page = 1 } = options;

  // unstable_cacheを使用してISRを実装
  // Use unstable_cache to implement ISR
  return unstable_cache(
    async () => {
      const where: any = {
        deletedAt: null, // 削除されていない投稿のみ取得 / Only get non-deleted posts
      };
      if (userId) where.userId = userId;

      const skip = (page - 1) * limit;

      const posts = await prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: userSelectPublicExtended,
          },
          category: {
            select: categorySelect,
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      // 削除されたカテゴリを持つPostのcategoryをnullに設定 / Set category to null for posts with deleted categories
      const postsWithValidCategories = posts.map((post) => ({
        ...post,
        category: post.category?.deletedAt ? null : post.category,
      }));

      return postsWithValidCategories as PostWithUser[];
    },
    [`posts-${userId || "all"}-${page}-${limit}`], // Cache key（パラメータを含む）
    {
      tags: ["posts"], // Cache tag for revalidation
      revalidate: 60, // ISR間隔：60秒ごとに再検証
    }
  )();
}

/**
 * Get hot posts based on engagement metrics
 * 熱門貼文を取得（エンゲージメント指標に基づく）
 * Uses ISR with cache tags for optimal performance
 */
export async function getHotPosts(
  options: { limit?: number; timeRangeHours?: number } = {}
): Promise<PostWithUser[]> {
  const { limit = 20, timeRangeHours = 48 } = options;

  // unstable_cacheを使用してISRを実装
  // Use unstable_cache to implement ISR
  return unstable_cache(
    async () => {
      // 時間範囲を計算（例：48時間前から現在まで）
      // Calculate time range (e.g., last 48 hours)
      const timeThreshold = new Date();
      timeThreshold.setHours(timeThreshold.getHours() - timeRangeHours);

      // 削除されていない投稿を取得して熱度スコアを計算
      // Fetch non-deleted posts and calculate hot score
      const posts = await prisma.post.findMany({
        where: {
          createdAt: {
            gte: timeThreshold,
          },
          deletedAt: null, // 削除されていない投稿のみ / Only non-deleted posts
        },
        include: {
          user: {
            select: userSelectPublicExtended,
          },
          category: {
            select: categorySelect,
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      // 削除されたカテゴリを持つPostのcategoryをnullに設定 / Set category to null for posts with deleted categories
      const postsWithValidCategories = posts.map((post) => ({
        ...post,
        category: post.category?.deletedAt ? null : post.category,
      }));

      // 熱度スコアを計算してソート
      // Calculate hot score and sort
      const postsWithScore = postsWithValidCategories.map((post) => {
        // 時間減衰係数を計算（新しい投稿ほど高いスコア）
        // Calculate time decay factor (newer posts get higher score)
        const hoursSinceCreation =
          (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0, 1 - hoursSinceCreation / timeRangeHours);

        // 熱度スコア = (likes × 2) + (comments × 1.5) + (views × 0.1) + 時間減衰
        // Hot score = (likes × 2) + (comments × 1.5) + (views × 0.1) + time decay
        const hotScore =
          post.likes * 2 +
          post._count.comments * 1.5 +
          post.views * 0.1 +
          timeDecay * 10;

        return {
          ...post,
          hotScore,
        };
      });

      // 熱度スコアで降順ソート
      // Sort by hot score descending
      postsWithScore.sort((a, b) => b.hotScore - a.hotScore);

      // 上位limit件を返す
      // Return top limit posts
      return postsWithScore.slice(0, limit) as PostWithUser[];
    },
    ["hot-posts"], // Cache key
    {
      tags: ["hot-posts"], // Cache tag for revalidation
      revalidate: 60, // ISR間隔：60秒ごとに再検証
    }
  )();
}

/**
 * Get a single post by ID with full details
 * 削除された投稿も取得可能（表示のため）
 * Can retrieve deleted posts for display purposes
 */
export async function getPostById(id: string) {
  "use cache";
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
      category: {
        select: categorySelect,
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: userSelectPublicExtended,
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

  // 削除されたカテゴリの場合はnullに設定 / Set category to null if deleted
  if (post && post.category?.deletedAt) {
    return {
      ...post,
      category: null,
    };
  }

  return post;
}

/**
 * Get total count of posts with optional filtering
 * 削除されていない投稿のみカウント / Only count non-deleted posts
 */
export async function getPostsCount(
  options: Omit<GetPostsOptions, "limit" | "page"> = {}
): Promise<number> {
  "use cache";
  const { userId } = options;

  const where: any = {
    deletedAt: null, // 削除されていない投稿のみ / Only non-deleted posts
  };
  if (userId) where.userId = userId;

  return await prisma.post.count({ where });
}

/**
 * Create a new post
 */
export async function createPost(
  userId: string,
  data: { title: string; content: string; tags: string[]; categoryId?: string | null }
) {
  // カテゴリが指定されている場合、存在し未削除であることを確認
  // If category is specified, verify it exists and is not deleted
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.deletedAt) {
      throw new Error("Category not found or has been deleted");
    }
  }

  return await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      tags: data.tags,
      categoryId: data.categoryId || null,
      userId,
    },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
      category: {
        select: categorySelect,
      },
    },
  });
}

/**
 * Update a post
 */
export async function updatePost(
  id: string,
  data: { title?: string; content?: string; tags?: string[]; categoryId?: string | null }
) {
  // カテゴリが指定されている場合、存在し未削除であることを確認
  // If category is specified, verify it exists and is not deleted
  if (data.categoryId !== undefined) {
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.deletedAt) {
        throw new Error("Category not found or has been deleted");
      }
    }
  }

  return await prisma.post.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId || null }),
    },
    include: {
      user: {
        select: userSelectPublicExtended,
      },
      category: {
        select: categorySelect,
      },
    },
  });
}

/**
 * Soft delete a post
 * 投稿をソフトデリート
 */
export async function softDeletePost(id: string) {
  return await prisma.post.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Delete a post (deprecated - use softDeletePost instead)
 * @deprecated Use softDeletePost instead
 */
export async function deletePost(id: string) {
  return await softDeletePost(id);
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
export async function hasUserLikedPost(
  userId: string,
  postId: string
): Promise<boolean> {
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
 * 管理員用：すべての投稿を取得（削除された投稿も含む）
 * Admin: Get all posts including deleted ones
 */
export async function getAllPostsAdmin(
  options: { page?: number; limit?: number; includeDeleted?: boolean } = {}
) {
  const { page = 1, limit = 20, includeDeleted = true } = options;
  const skip = (page - 1) * limit;

  const where: any = {};
  // デフォルトでは削除された投稿も含める / By default include deleted posts
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: userSelectPublicExtended,
        },
        category: {
          select: categorySelect,
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
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
 * Admin: Soft delete any post
 * 管理員用：任意の投稿をソフトデリート
 */
export async function deletePostAdmin(postId: string) {
  return await softDeletePost(postId);
}
