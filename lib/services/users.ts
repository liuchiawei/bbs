import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type {
  User,
  UserWithCounts,
  UserWithStats,
  UserProfilePage,
  UserWithProfile,
  PostWithUser,
  CommentWithUser,
  CommentWithUserAndPost,
  AdminUserListItem,
} from "@/lib/types";
import {
  userSelectFull,
  userSelectWithStats,
  userSelectPublicExtended,
  profileSelectPublic,
  categorySelect,
} from "@/lib/types/prisma-selects";
import { transformUser } from "@/lib/utils";
import { transformAdminUserListItem } from "@/lib/utils/admin";

/**
 * Check if a userId is available
 */
export async function checkUserIdAvailability(
  userId: string
): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { userId: userId },
    select: { id: true },
  });
  return !existingUser;
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  "use cache";
  return (await prisma.user.findUnique({
    where: { id },
    select: userSelectFull,
  })) as User | null;
}

/**
 * Get a user with post and comment counts
 */
export async function getUserWithCounts(
  id: string
): Promise<UserWithCounts | null> {
  "use cache";
  const result = await prisma.user.findUnique({
    where: { id },
    select: userSelectWithStats,
  });
  return result as UserWithCounts | null;
}

/**
 * Get a user's profile data (for settings/edit pages)
 * Cache を使用してパフォーマンスを最適化
 */
export async function getUserProfile(
  userId: string
): Promise<UserWithProfile | null> {
  "use cache";
  const user = await prisma.user.findUnique({
    where: { userId },
    select: userSelectFull,
  });

  if (!user || !user.profile) {
    return null;
  }

  return user as UserWithProfile;
}

/**
 * Update user profile (deprecated - use Profile Service instead)
 * @deprecated Use updateProfile from lib/services/profiles instead
 */
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    gender?: string | null;
    birthDate?: Date | null;
    avatar?: string | null;
    points?: number;
  }
) {
  // 僅更新points（User欄位）
  // Only update points (User field)
  const updateData: any = {};
  if (data.points !== undefined) {
    updateData.points = data.points;
  }

  return await prisma.user.update({
    where: { userId },
    data: updateData,
    select: userSelectFull,
  });
}

/**
 * Get a user's full profile page data (optimized single query)
 * Includes user info, counts, and recent posts
 */
export async function getUserProfilePage(
  userId: string,
  recentPostsLimit = 6
): Promise<UserProfilePage | null> {
  "use cache";
  const result = await prisma.user.findUnique({
    where: { userId },
    select: {
      ...userSelectFull,
      posts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: recentPostsLimit,
        select: {
          id: true,
          title: true,
          content: true,
          tags: true,
          views: true,
          likes: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          categoryId: true,
          eventId: true,
          deletedAt: true,
          user: {
            select: {
              id: true,
              userId: true,
              email: true,
              profile: {
                select: profileSelectPublic,
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          posts: true,
          comments: true,
          likedPosts: true,
          likedComments: true,
          followedBy: true, // followers count
          following: true, // following count
        },
      },
    },
  });

  if (!result || !result.profile) {
    return null;
  }

  // Transform _count to match UserStats interface
  // Prisma returns 'followedBy' but UserStats expects 'followers'
  // Prisma 返回 'followedBy' 但 UserStats 期望 'followers'
  return {
    ...result,
    _count: {
      ...result._count,
      followers: result._count.followedBy,
    },
  } as UserProfilePage;
}

/**
 * Get user's liked posts
 */
export async function getUserLikedPosts(
  userId: string
): Promise<PostWithUser[]> {
  "use cache";
  const likes = await prisma.postLike.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
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
      },
    },
  });

  // 使用 transformUser 轉換用戶資料為扁平結構
  // Use transformUser to transform user data to flat structure
  const transformedPosts = likes.map((like) => {
    const transformedUser = transformUser(like.post.user);
    return {
      ...like.post,
      category: like.post.category?.deletedAt ? null : like.post.category,
      user: transformedUser,
      _count: like.post._count,
    };
  });

  return transformedPosts as PostWithUser[];
}

/**
 * Get user's liked comments
 */
export async function getUserLikedComments(
  userId: string
): Promise<CommentWithUserAndPost[]> {
  "use cache";
  const likes = await prisma.commentLike.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      comment: {
        include: {
          user: {
            select: userSelectPublicExtended,
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  // 使用 transformUser 轉換用戶資料為扁平結構
  // Use transformUser to transform user data to flat structure
  return likes.map((like) => ({
    id: like.comment.id,
    content: like.comment.content,
    userId: like.comment.userId,
    postId: like.comment.postId,
    parentId: like.comment.parentId,
    likes: like.comment.likes,
    replies: like.comment.replies,
    createdAt: like.comment.createdAt,
    updatedAt: like.comment.updatedAt,
    deletedAt: like.comment.deletedAt,
    user: transformUser(like.comment.user),
    post: like.comment.post,
  })) as CommentWithUserAndPost[];
}

/**
 * Get user with their comments
 */
export async function getUserComments(userId: string) {
  "use cache";
  return await prisma.user.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      profile: {
        select: profileSelectPublic,
      },
      comments: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              email: true,
              profile: {
                select: profileSelectPublic,
              },
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              content: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Admin: Get all users with pagination and counts
 * 管理員：獲取所有用戶（分頁和計數）
 *
 * Uses cache for performance optimization (60 second revalidate)
 * 使用快取優化效能（60秒重新驗證）
 *
 * Transforms Prisma query results to AdminUserListItem format
 * 將 Prisma 查詢結果轉換為 AdminUserListItem 格式
 */
export async function getAllUsers(
  options: { page?: number; limit?: number } = {}
): Promise<{
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // キャッシュキーを生成（ページとリミットを含む）
  // Generate cache key (including page and limit)
  const cacheKey = `admin-users-${page}-${limit}`;

  return unstable_cache(
    async () => {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            userId: true,
            email: true,
            isAdmin: true,
            isBanned: true,
            points: true,
            createdAt: true,
            profile: {
              where: { deletedAt: null },
              select: {
                name: true,
                nickname: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                posts: true,
                comments: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      // Transform users to AdminUserListItem format
      // 將用戶轉換為 AdminUserListItem 格式
      const transformedUsers = users.map(transformAdminUserListItem);

      return {
        users: transformedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    [cacheKey],
    {
      tags: ["admin-users"],
      revalidate: 60, // 60秒ごとに再検証 / Revalidate every 60 seconds
    }
  )();
}

/**
 * Admin: Get total users count
 */
export async function getUsersCount(): Promise<number> {
  return await prisma.user.count();
}

/**
 * Admin: Ban a user
 */
export async function banUser(userId: string) {
  return await prisma.user.update({
    where: { userId },
    data: { isBanned: true },
    select: {
      id: true,
      userId: true,
      email: true,
      isBanned: true,
      profile: {
        select: {
          name: true,
        },
      },
    },
  });
}

/**
 * Admin: Unban a user
 */
export async function unbanUser(userId: string) {
  return await prisma.user.update({
    where: { userId },
    data: { isBanned: false },
    select: {
      id: true,
      userId: true,
      email: true,
      isBanned: true,
      profile: {
        select: {
          name: true,
        },
      },
    },
  });
}
