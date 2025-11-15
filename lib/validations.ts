import { z } from "zod";
import { Prisma } from "@prisma/client";
import { APP_CONSTANTS, t } from "./constants";

// Validation Constants
export const USER_ID_REGEX = /^[a-zA-Z0-9]{1,12}$/;
export const USER_ID_MIN_LENGTH = 1;
export const USER_ID_MAX_LENGTH = 12;

// Reusable Prisma Select Fragments
// 公開顯示用使用者資料（不包含敏感資訊）
export const userSelectPublic = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.UserSelect;

// 公開顯示用使用者資料（擴展版，包含 email）
export const userSelectPublicExtended = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  avatar: true,
  email: true,
} satisfies Prisma.UserSelect;

// 完整使用者資料（所有欄位）
export const userSelectFull = {
  id: true,
  userId: true,
  name: true,
  nickname: true,
  email: true,
  gender: true,
  birthDate: true,
  avatar: true,
  isAdmin: true,
  isBanned: true,
  points: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// 完整使用者資料 + 統計
// 注意：_count 不是 UserSelect 的一部分，所以這裡使用 any 來繞過類型檢查
export const userSelectWithStats = {
  ...userSelectFull,
  _count: {
    select: {
      posts: true,
      comments: true,
      likedPosts: true,
      likedComments: true,
    },
  },
} as any;

// 向後兼容：保留 userSelectBasic 作為 userSelectPublic 的別名
export const userSelectBasic = userSelectPublic;

export const postIncludeBasic = {
  user: { select: userSelectPublicExtended },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export const commentIncludeBasic = {
  user: { select: userSelectPublicExtended },
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
    .max(
      APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH,
      `Nickname must be ${APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH} characters or less`
    )
    .optional(),
  email: z.string().email(t("ALERT_INVALID_EMAIL_ADDRESS")),
  password: z
    .string()
    .min(APP_CONSTANTS.USER_PASSWORD_MIN_LENGTH, t("ALERT_PASSWORD_MIN_LENGTH"))
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
  name: z
    .string()
    .min(
      APP_CONSTANTS.USER_NAME_MIN_LENGTH,
      `Name must be at least ${APP_CONSTANTS.USER_NAME_MIN_LENGTH} characters`
    )
    .max(
      APP_CONSTANTS.USER_NAME_MAX_LENGTH,
      `Name must be ${APP_CONSTANTS.USER_NAME_MAX_LENGTH} characters or less`
    )
    .optional(),
  nickname: z
    .string()
    .max(
      APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH,
      `Nickname must be ${APP_CONSTANTS.USER_NICKNAME_MAX_LENGTH} characters or less`
    )
    .optional(),
  gender: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

// Post Schemas
// タグを文字列または配列として受け取り、配列に変換する
const tagsSchema = z.preprocess((val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}, z.array(z.string()));

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  tags: tagsSchema.optional().default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")).optional(),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")).optional(),
  tags: tagsSchema.optional(),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  postId: z.string(),
  parentId: z.string().optional(),
});
