import { z } from "zod";
import { Prisma } from "@prisma/client";

// Validation Constants
export const USER_ID_REGEX = /^[a-zA-Z0-9]{1,12}$/;
export const USER_ID_MIN_LENGTH = 1;
export const USER_ID_MAX_LENGTH = 12;

// Reusable Prisma Select Fragments
export const userSelectBasic = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export const categorySelectBasic = {
  id: true,
  slug: true,
  name: true,
} satisfies Prisma.CategorySelect;

export const postIncludeBasic = {
  user: { select: userSelectBasic },
  category: { select: categorySelectBasic },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export const commentIncludeBasic = {
  user: { select: userSelectBasic },
} satisfies Prisma.CommentInclude;

// Auth Schemas
export const registerSchema = z.object({
  userId: z.string()
    .min(USER_ID_MIN_LENGTH, "User ID is required")
    .max(USER_ID_MAX_LENGTH, "User ID must be 12 characters or less")
    .regex(/^[a-zA-Z0-9]+$/, "User ID can only contain English letters and numbers"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  nickname: z.string().min(2, "Nickname must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
});

export const loginSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

// User Schemas
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  points: z.number().int().min(0).optional(),
});

// Post Schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  tags: z.array(z.string()).optional(),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  postId: z.string(),
  parentId: z.string().optional(),
});

// Admin Category Schemas
export const adminCreateCategorySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const adminUpdateCategorySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
