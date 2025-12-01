import { z } from "zod";
import { Prisma } from "@prisma/client";
import { APP_CONSTANTS, t } from "./constants";
import {
  profileSelectPublic,
  categorySelect,
} from "./types/prisma-selects";

// Validation Constants
export const USER_ID_REGEX = /^[a-zA-Z0-9]{1,12}$/;
export const USER_ID_MIN_LENGTH = 1;
export const USER_ID_MAX_LENGTH = 12;

export const postIncludeBasic = {
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
  category: { select: categorySelect },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

export const commentIncludeBasic = {
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
  email: z.string().email(t("ALERT_INVALID_EMAIL_ADDRESS")),
  password: z
    .string()
    .min(APP_CONSTANTS.USER_PASSWORD_MIN_LENGTH, t("ALERT_PASSWORD_MIN_LENGTH"))
    .max(
      APP_CONSTANTS.USER_PASSWORD_MAX_LENGTH,
      `Password must be ${APP_CONSTANTS.USER_PASSWORD_MAX_LENGTH} characters or less`
    ),
});

export const loginSchema = z.object({
  userId: z.string().min(1, t("ALERT_USER_ID_REQUIRED")),
  password: z.string().min(1, t("ALERT_PASSWORD_REQUIRED")),
});

// Profile Visibility Schemas
export const profileVisibilitySchema = z.enum(["public", "friends", "private"]);

export const profileVisibilitySettingsSchema = z.object({
  name: profileVisibilitySchema.optional(),
  nickname: profileVisibilitySchema.optional(),
  gender: profileVisibilitySchema.optional(),
  birthDate: profileVisibilitySchema.optional(),
  avatar: profileVisibilitySchema.optional(),
  height: profileVisibilitySchema.optional(),
  weight: profileVisibilitySchema.optional(),
  description: profileVisibilitySchema.optional(),
  record: profileVisibilitySchema.optional(),
  train_start: profileVisibilitySchema.optional(),
  stance: profileVisibilitySchema.optional(),
  gym: profileVisibilitySchema.optional(),
});

// Profile Schemas
export const createProfileSchema = z.object({
  userId: z.string(),
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
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  height: z.number().int().positive().max(300).optional().nullable(), // cm
  weight: z.number().int().positive().max(500).optional().nullable(), // kg
  description: z.string().max(1000).optional().nullable(),
  record: z.string().max(500).optional().nullable(),
  train_start: z.number().int().min(1900).max(2100).optional().nullable(), // 西元年
  stance: z.string().max(50).optional().nullable(),
  gym: z.string().max(100).optional().nullable(),
  visibility: profileVisibilitySettingsSchema.optional(), // 可見性設定（可選，預設全public）
});

export const updateProfileSchema = createProfileSchema.partial().extend({
  userId: z.string().optional(), // userId不可更新
});

export const updateVisibilitySchema = z.object({
  visibility: profileVisibilitySettingsSchema,
});

// User Schemas (deprecated - use Profile schemas instead)
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
  categoryId: z.string().uuid().optional().nullable(),
  eventId: z.string().optional().nullable(), // UUID または新しいタイムスタンプ形式を許可 / Allow UUID or new timestamp format
});

export const updatePostSchema = z.object({
  title: z.string().min(1, t("ALERT_TITLE_REQUIRED")).optional(),
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")).optional(),
  tags: tagsSchema.optional(),
  categoryId: z.string().uuid().optional().nullable(),
  eventId: z.string().optional().nullable(), // UUID または新しいタイムスタンプ形式を許可 / Allow UUID or new timestamp format
});

// Category Schemas
export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().optional(),
  description: z.string().max(200).optional(),
  displayOrder: z.number().int().positive().min(1),
});

export const createCategorySchema = categorySchema;

export const updateCategorySchema = categorySchema.partial();

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, t("ALERT_CONTENT_REQUIRED")),
  postId: z.string(),
  parentId: z.string().optional(),
});

// Betting Schemas
// 投注相關 Schema
// Betting validation schemas
// 投注驗證 schemas

/**
 * Place bet schema (updated to use fightId)
 * 投注驗證 schema（更新為使用 fightId）
 */
export const placeBetSchema = z.object({
  fightId: z.string().min(1, "Fight ID is required"), // 對戰ID（必填）
  target_winner_id: z.string().min(1, "Target winner ID is required"), // 目標勝者ID（必填）
  amount: z
    .number()
    .min(50, "Minimum bet is 50 points") // 最小投注50點
    .refine((val) => val % 10 === 0, {
      message: "Amount must be multiple of 10", // 必須是10的倍數
    }),
});

// Settle Fight Schema
// 結算對戰 Schema
export const settleFightSchema = z.object({
  winnerId: z.string().min(1, "Winner ID is required"), // 勝者ID（必填）
  winMethod: z.string().optional(), // 勝利方式（可選）
  winRound: z.number().int().positive().optional(), // 勝利回合（可選，正整數）
});

// Settle Event Schema (deprecated, use settleFightSchema)
// 結算賽事 Schema（已棄用，請使用 settleFightSchema）
export const settleEventSchema = z.object({
  winnerId: z.string(),
  winMethod: z.string().optional(),
  winRound: z.number().int().positive().optional(),
  eventId: z.string(),
  target_winner_id: z.string(),
  amount: z
    .number()
    .min(50, "Minimum bet is 50 points")
    .refine((val) => val % 10 === 0, "Amount must be multiple of 10"),
});

