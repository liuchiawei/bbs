import { prisma } from "@/lib/db";
import type { User, UserWithCounts, UserWithStats, UserProfilePage } from "@/lib/types";
import { userSelectFull, userSelectWithStats, userSelectPublicExtended } from "@/lib/validations";

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
  return await prisma.user.findUnique({
    where: { id },
    select: userSelectFull,
  });
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
export async function getUserProfile(userId: string) {
  "use cache";
  return await prisma.user.findUnique({
    where: { id: userId },
    select: userSelectFull,
  });
}

/**
 * Update user profile
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
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelectFull,
  });
}

/**
 * Get a user's full profile page data (optimized single query)
 * Includes user info, counts, and recent posts
 */
export async function getUserProfilePage(userId: string, recentPostsLimit = 6): Promise<UserProfilePage | null> {
  "use cache";
  const result = await prisma.user.findUnique({
    where: { userId },
    select: {
      ...userSelectFull,
      posts: {
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
          user: {
            select: userSelectPublicExtended,
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
        },
      },
    },
  });
  return result as UserProfilePage | null;
}

/**
 * Get user's liked posts
 */
export async function getUserLikedPosts(userId: string) {
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
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  });

  return likes.map((like) => like.post);
}

/**
 * Get user's liked comments
 */
export async function getUserLikedComments(userId: string) {
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

  return likes.map((like) => like.comment);
}

/**
 * Get user with their comments
 */
export async function getUserComments(userId: string) {
  "use cache";
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: userSelectPublicExtended,
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
 */
export async function getAllUsers(
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        name: true,
        nickname: true,
        email: true,
        avatar: true,
        isAdmin: true,
        isBanned: true,
        points: true,
        createdAt: true,
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

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
    where: { id: userId },
    data: { isBanned: true },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      isBanned: true,
    },
  });
}

/**
 * Admin: Unban a user
 */
export async function unbanUser(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      isBanned: true,
    },
  });
}
