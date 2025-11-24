/**
 * Prisma Generated Types
 * Prisma 生成的類型
 *
 * 使用 Prisma GetPayload 從 select schemas 生成應用類型
 * Generate application types from select schemas using Prisma GetPayload
 */

import { Prisma } from "@prisma/client";
import type { PrismaToApp } from "./utilities";
import {
  // Event selects
  eventSelectMinimal,
  eventSelectPublic,
  eventSelectFull,
  eventSelectWithFights,
  // Fight selects
  fightSelectMinimal,
  fightSelectPublic,
  fightSelectFull,
  fightSelectWithRelations,
  fightSelectWithFullRelations,
  // Fighter selects
  fighterSelectMinimal,
  fighterSelectPublic,
  fighterSelectFull,
  fighterSelectWithEvents,
  // Post selects
  postSelectMinimal,
  postSelectPublic,
  postSelectFull,
  postSelectWithUser,
  postSelectWithDetails,
  // Comment selects
  commentSelectMinimal,
  commentSelectPublic,
  commentSelectFull,
  commentSelectWithUser,
  commentSelectWithUserAndPost,
  // BettingLog selects
  bettingLogSelectMinimal,
  bettingLogSelectFull,
  // Re-exported selects
  profileSelectPublic,
  profileSelectFull,
  userSelectPublic,
  userSelectPublicExtended,
  userSelectFull,
  categorySelect,
} from "./prisma-selects";

// ============================================================================
// Profile Types
// ============================================================================

export type ProfilePublic = PrismaToApp<
  Prisma.ProfileGetPayload<{
    select: typeof profileSelectPublic;
  }>
>;

export type ProfileFull = PrismaToApp<
  Prisma.ProfileGetPayload<{
    select: typeof profileSelectFull;
  }>
>;

// ============================================================================
// User Types
// ============================================================================

export type UserPublic = PrismaToApp<
  Prisma.UserGetPayload<{
    select: typeof userSelectPublic;
  }>
>;

export type UserPublicExtended = PrismaToApp<
  Prisma.UserGetPayload<{
    select: typeof userSelectPublicExtended;
  }>
>;

export type UserFull = PrismaToApp<
  Prisma.UserGetPayload<{
    select: typeof userSelectFull;
  }>
>;

// ============================================================================
// Category Types
// ============================================================================

export type Category = PrismaToApp<
  Prisma.CategoryGetPayload<{
    select: typeof categorySelect;
  }>
>;

// ============================================================================
// Event Types
// ============================================================================

export type EventMinimal = PrismaToApp<
  Prisma.EventGetPayload<{
    select: typeof eventSelectMinimal;
  }>
>;

export type EventPublic = PrismaToApp<
  Prisma.EventGetPayload<{
    select: typeof eventSelectPublic;
  }>
>;

export type EventFull = PrismaToApp<
  Prisma.EventGetPayload<{
    select: typeof eventSelectFull;
  }>
>;

export type EventWithFights = PrismaToApp<
  Prisma.EventGetPayload<{
    select: typeof eventSelectWithFights;
  }>
>;

// ============================================================================
// Fight Types
// ============================================================================

export type FightMinimal = PrismaToApp<
  Prisma.FightGetPayload<{
    select: typeof fightSelectMinimal;
  }>
>;

export type FightPublic = PrismaToApp<
  Prisma.FightGetPayload<{
    select: typeof fightSelectPublic;
  }>
>;

export type FightFull = PrismaToApp<
  Prisma.FightGetPayload<{
    select: typeof fightSelectFull;
  }>
>;

export type FightWithRelations = PrismaToApp<
  Prisma.FightGetPayload<{
    select: typeof fightSelectWithRelations;
  }>
>;

export type FightWithFullRelations = PrismaToApp<
  Prisma.FightGetPayload<{
    select: typeof fightSelectWithFullRelations;
  }>
>;

// ============================================================================
// Fighter Types
// ============================================================================

export type FighterMinimal = PrismaToApp<
  Prisma.FighterGetPayload<{
    select: typeof fighterSelectMinimal;
  }>
>;

export type FighterPublic = PrismaToApp<
  Prisma.FighterGetPayload<{
    select: typeof fighterSelectPublic;
  }>
>;

export type FighterFull = PrismaToApp<
  Prisma.FighterGetPayload<{
    select: typeof fighterSelectFull;
  }>
>;

export type FighterWithEvents = PrismaToApp<
  Prisma.FighterGetPayload<{
    select: typeof fighterSelectWithEvents;
  }>
>;

// ============================================================================
// Post Types
// ============================================================================

export type PostMinimal = PrismaToApp<
  Prisma.PostGetPayload<{
    select: typeof postSelectMinimal;
  }>
>;

export type PostPublic = PrismaToApp<
  Prisma.PostGetPayload<{
    select: typeof postSelectPublic;
  }>
>;

export type PostFull = PrismaToApp<
  Prisma.PostGetPayload<{
    select: typeof postSelectFull;
  }>
>;

export type PostWithUser = PrismaToApp<
  Prisma.PostGetPayload<{
    select: typeof postSelectWithUser;
  }>
>;

export type PostWithDetails = PrismaToApp<
  Prisma.PostGetPayload<{
    select: typeof postSelectWithDetails;
  }>
>;

// ============================================================================
// Comment Types
// ============================================================================

export type CommentMinimal = PrismaToApp<
  Prisma.CommentGetPayload<{
    select: typeof commentSelectMinimal;
  }>
>;

export type CommentPublic = PrismaToApp<
  Prisma.CommentGetPayload<{
    select: typeof commentSelectPublic;
  }>
>;

export type CommentFull = PrismaToApp<
  Prisma.CommentGetPayload<{
    select: typeof commentSelectFull;
  }>
>;

export type CommentWithUser = PrismaToApp<
  Prisma.CommentGetPayload<{
    select: typeof commentSelectWithUser;
  }>
>;

export type CommentWithUserAndPost = PrismaToApp<
  Prisma.CommentGetPayload<{
    select: typeof commentSelectWithUserAndPost;
  }>
>;

// ============================================================================
// BettingLog Types
// ============================================================================

export type BettingLogMinimal = PrismaToApp<
  Prisma.BettingLogGetPayload<{
    select: typeof bettingLogSelectMinimal;
  }>
>;

export type BettingLogFull = PrismaToApp<
  Prisma.BettingLogGetPayload<{
    select: typeof bettingLogSelectFull;
  }>
>;
