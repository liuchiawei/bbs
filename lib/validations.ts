import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// User Schemas
export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
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
