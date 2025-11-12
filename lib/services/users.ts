import { prisma } from "@/lib/db";
import type { User, UserWithCounts } from "@/lib/types";

/**
 * Get a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get a user with post and comment counts
 */
export async function getUserWithCounts(id: string): Promise<UserWithCounts | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          posts: true,
          comments: true,
        },
      },
    },
  });
}

/**
 * Get a user's profile data (for settings/edit pages)
 */
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
    },
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
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      birthDate: true,
      avatar: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Get user's liked posts
 */
export async function getUserLikedPosts(userId: string) {
  const likes = await prisma.postLike.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
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
      },
    },
  });

  return likes.map((like) => like.post);
}

/**
 * Get user's liked comments
 */
export async function getUserLikedComments(userId: string) {
  const likes = await prisma.commentLike.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      comment: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
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
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
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
 */
export async function getAllUsers(options: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isAdmin: true,
        isBanned: true,
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
      name: true,
      email: true,
      isBanned: true,
    },
  });
}
