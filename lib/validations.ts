import { z } from "zod";
import { Prisma } from "@prisma/client";
import { APP_CONSTANTS, t } from "./constants";

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
  userId: z
    .string()
    .min(APP_CONSTANTS.USER_ID_MIN_LENGTH, t("ALERT_USER_ID_REQUIRED"))
    .max(
      APP_CONSTANTS.USER_ID_MAX_LENGTH,
      `User ID must be ${APP_CONSTANTS.USER_ID_MAX_LENGTH} characters or less`
    )
    .regex(
      APP_CONSTANTS.USER_ID_REGEX,
      t("ALERT_USER_ID_CAN_ONLY_CONTAIN_ENGLISH_LETTERS_AND_NUMBERS")
    ),
  name: z
    .string()
    .min(
      APP_CONSTANTS.USER_NAME_MIN_LENGTH,
      `Name must be at least ${APP_CONSTANTS.USER_NAME_MIN_LENGTH} characters`
    )
    .max(
      APP_CONSTANTS.USER_NAME_MAX_LENGTH,
      `Name must be ${APP_CONSTANTS.USER_NAME_MAX_LENGTH} characters or less`
    ),
  nickname: z
    .string()
    .min(
      APP_CONSTANTS.USER_NICKNAME_MIN_LENGTH,
      `Nickname must be at least ${APP_CONSTANTS.USER_NICKNAME_MIN_LENGTH} characters`
    )
    .max(
      APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH,
      `Nickname must be ${APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH} characters or less`
    )
    .optional(),
  email: z.string().email(t("ALERT_INVALID_EMAIL_ADDRESS")),
  password: z
    .string()
    .min(
      APP_CONSTANTS.USER_PASSWORD_MIN_LENGTH,
      `Password must be at least ${APP_CONSTANTS.USER_PASSWORD_MIN_LENGTH} characters`
    )
    .max(
      APP_CONSTANTS.USER_PASSWORD_MAX_LENGTH,
      `Password must be ${APP_CONSTANTS.USER_PASSWORD_MAX_LENGTH} characters or less`
    ),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
});

export const loginSchema = z.object({
  userId: z.string().min(1, t("ALERT_USER_ID_REQUIRED")),
  password: z.string().min(1, t("ALERT_PASSWORD_REQUIRED")),
});

// User Schemas
export const updateUserSchema = z.object({
  name: z.string().min(APP_CONSTANTS.USER_NAME_MIN_LENGTH, `Name must be at least ${APP_CONSTANTS.USER_NAME_MIN_LENGTH} characters`).max(APP_CONSTANTS.USER_NAME_MAX_LENGTH, `Name must be ${APP_CONSTANTS.USER_NAME_MAX_LENGTH} characters or less`).optional(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  points: z.number().int().min(0).optional(),
});

// Post Schemas
export const createPostSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  categoryId: z.string().min(1, t("ALERT_CATEGORY_REQUIRED")),
  tags: z.array(z.string()).optional().default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")).optional(),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")).optional(),
  categoryId: z.string().min(1, t("ALERT_CATEGORY_REQUIRED")).optional(),
  tags: z.array(z.string()).optional(),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  postId: z.string(),
  parentId: z.string().optional(),
});

// Admin Category Schemas
export const adminCreateCategorySchema = z.object({
  slug: z
    .string()
    .min(1, t("ALERT_SLUG_REQUIRED"))
    .regex(/^[a-z0-9-]+$/, t("ALERT_SLUG_MUST_BE_LOWERCASE_ALPHANUMERIC_WITH_HYPHENS")),
  name: z.string().min(1, t("ALERT_NAME_REQUIRED")),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const adminUpdateCategorySchema = z.object({
  slug: z
    .string()
    .min(1, t("ALERT_SLUG_REQUIRED"))
    .regex(/^[a-z0-9-]+$/, t("ALERT_SLUG_MUST_BE_LOWERCASE_ALPHANUMERIC_WITH_HYPHENS"))
    .optional(),
  name: z.string().min(1, t("ALERT_NAME_REQUIRED")).optional(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
