/**
 * Type Definitions
 * 類型定義
 *
 * 此文件使用 Prisma 生成的類型作為基礎，同時保留向後兼容的類型別名
 * This file uses Prisma-generated types as base, while maintaining backward-compatible type aliases
 */

// Import Prisma-generated types
// 導入 Prisma 生成的類型
import type {
  ProfilePublic as PrismaProfilePublic,
  ProfileFull as PrismaProfileFull,
  UserPublic as PrismaUserPublic,
  UserPublicExtended as PrismaUserPublicExtended,
  UserFull as PrismaUserFull,
  Category as PrismaCategory,
  EventPublic as PrismaEventPublic,
  EventFull as PrismaEventFull,
  EventWithFights as PrismaEventWithFights,
  FightPublic as PrismaFightPublic,
  FightFull as PrismaFightFull,
  FightWithRelations as PrismaFightWithRelations,
  FighterPublic as PrismaFighterPublic,
  FighterFull as PrismaFighterFull,
  FighterWithEvents as PrismaFighterWithEvents,
  PostPublic as PrismaPostPublic,
  PostFull as PrismaPostFull,
  PostWithUser as PrismaPostWithUser,
  PostWithDetails as PrismaPostWithDetails,
  CommentPublic as PrismaCommentPublic,
  CommentFull as PrismaCommentFull,
  CommentWithUser as PrismaCommentWithUser,
  CommentWithUserAndPost as PrismaCommentWithUserAndPost,
  BettingLogFull as PrismaBettingLogFull,
} from "@/lib/types/prisma-generated";

// Re-export utility types
// 重新導出工具類型
export type {
  Paginated,
  PaginatedResponse,
  ApiResponse,
  ApiErrorResponse,
  WithRelations,
  WithCount,
  PrismaToApp,
} from "@/lib/types/utilities";

// Profile Visibility Types
// プロフィールの可視性タイプ
// 個人資料欄位的隱私級別設定
export type ProfileVisibility = "public" | "friends" | "private";

// プロフィールの可視性設定
// Profile visibility settings for all fields
export interface ProfileVisibilitySettings {
  name?: ProfileVisibility;
  nickname?: ProfileVisibility;
  gender?: ProfileVisibility;
  birthDate?: ProfileVisibility;
  avatar?: ProfileVisibility;
  height?: ProfileVisibility;
  weight?: ProfileVisibility;
  description?: ProfileVisibility;
  record?: ProfileVisibility;
  train_start?: ProfileVisibility;
  stance?: ProfileVisibility;
  gym?: ProfileVisibility;
}

// Profile Types
// プロフィールタイプ
// 完整的個人資料類型定義（包含所有欄位和可見性設定）
// Using Prisma-generated type as base
export type Profile = PrismaProfileFull;

// 公開顯示用プロフィール
// Public profile for display (minimal fields)
// 使用 Prisma 生成的類型，保留向後兼容
// Using Prisma-generated type, maintaining backward compatibility
export type ProfilePublic = PrismaProfilePublic;

// プロフィール作成入力
// Create profile input type
export interface CreateProfileInput {
  userId: string;
  name: string;
  nickname?: string;
  gender?: string;
  birthDate?: string;
  avatar?: string;
  height?: number;
  weight?: number;
  description?: string;
  record?: string;
  train_start?: number;
  stance?: string;
  gym?: string;
  visibility?: ProfileVisibilitySettings;
}

// プロフィール更新入力
// Update profile input type
export interface UpdateProfileInput {
  name?: string;
  nickname?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  avatar?: string | null;
  height?: number | null;
  weight?: number | null;
  description?: string | null;
  record?: string | null;
  train_start?: number | null;
  stance?: string | null;
  gym?: string | null;
  visibility?: ProfileVisibilitySettings;
}

// 可視性設定更新入力
// Update visibility settings input type
export interface UpdateVisibilityInput {
  visibility: ProfileVisibilitySettings;
}

// User Types
// ユーザータイプ
// User簡化（僅登錄相關）/ Simplified User (login-related only)
export interface User {
  id: string;
  userId: string;
  email: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  points?: number;
  virtual_score?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  profile?: Profile | null;
}

// User + Profile組合類型（最常用）
// User with Profile (most commonly used)
export interface UserWithProfile extends User {
  profile: Profile;
}

// 公開顯示用使用者資料（從Profile讀取顯示資料）
// 注意：nickname 和 avatar 嚴格為 string | null（不允許 undefined）
// Note: nickname and avatar are strictly string | null (undefined not allowed)
// 使用 Prisma 生成的類型，保留向後兼容
// Using Prisma-generated type, maintaining backward compatibility
export type UserPublic = PrismaUserPublic;

// 公開顯示用使用者資料（擴展版，包含 email）
// Using Prisma-generated type, maintaining backward compatibility
export type UserPublicExtended = PrismaUserPublicExtended;

// 使用者統計資料
// User statistics (posts, comments, likes, followers, following)
export interface UserStats {
  posts: number;
  comments: number;
  likedPosts: number;
  likedComments: number;
  followers: number;
  following: number;
}

// 完整使用者資料 + 統計
// User with complete statistics
export interface UserWithStats extends User {
  _count: UserStats;
}

// 使用者資料 + 基本統計（用於向後兼容）
// User with basic counts (for backward compatibility)
export interface UserWithCounts extends User {
  _count?: {
    posts: number;
    comments: number;
    likedPosts?: number;
    likedComments?: number;
    followers?: number;
    following?: number;
  };
}

// 使用者個人資料頁（包含最近貼文和完整統計）
// User profile page (includes recent posts and complete statistics)
export interface UserProfilePage extends UserWithProfile {
  posts: Post[];
  _count: UserStats;
}

// User + Profile + 統計
// User with Profile and statistics
export interface UserWithProfileAndStats extends UserWithProfile {
  _count: UserStats;
}

// Category Types
// カテゴリータイプ
// Category type (for post categorization)
// Using Prisma-generated type, maintaining backward compatibility
export type Category = PrismaCategory;

// Post Types
// 投稿タイプ
// Post type (forum post/article)
// Using Prisma-generated type, maintaining backward compatibility
export type Post = PrismaPostPublic;

// 投稿 + ユーザー情報
// Post with user information and comment count
// Using Prisma-generated type, maintaining backward compatibility
export type PostWithUser = PrismaPostWithUser;

// 投稿詳細（コメント含む）
// Post with full details including comments
// Using Prisma-generated type, maintaining backward compatibility
export type PostWithDetails = PrismaPostWithDetails;

// Comment Types
// コメントタイプ
// Comment type (reply to posts)
// Using Prisma-generated type, maintaining backward compatibility
export type Comment = PrismaCommentPublic;

// コメント + ユーザー情報
// Comment with user information
// Using Prisma-generated type, maintaining backward compatibility
export type CommentWithUser = PrismaCommentWithUser;

// Comment with user and post (for liked comments page)
// コメント + ユーザー + 投稿情報（いいねしたコメントページ用）
// Using Prisma-generated type, maintaining backward compatibility
export type CommentWithUserAndPost = PrismaCommentWithUserAndPost;

// API Response Types
// APIレスポンスタイプ
// Generic API response wrapper
// Re-exported from utilities for convenience
// PaginatedResponse is already exported above from utilities
// PaginatedResponse 已經在上面從 utilities 導出

// ページネーションレスポンス
// Paginated API response
// Alias for backward compatibility
// 向後兼容別名
import type { PaginatedResponse } from "@/lib/types/utilities";
export type PaginationResponse<T> = PaginatedResponse<T>;

// Auth Types
// 認証タイプ
// Session payload (stored in JWT)
export interface SessionPayload {
  userId: string;
  email: string;
}

// ユーザー登録入力
// User registration input
export interface RegisterInput {
  userId: string;
  email: string;
  password: string;
}

// ログイン入力
// User login input
export interface LoginInput {
  userId: string;
  password: string;
}

// Form Types (deprecated - use UpdateProfileInput instead)
// フォームタイプ（非推奨 - UpdateProfileInputを使用）
export interface EditProfileInput {
  name?: string;
  gender?: string | null;
  birthDate?: string | null;
  avatar?: string | null;
}

// 投稿作成入力
// Create post input
export interface CreatePostInput {
  title: string;
  content: string;
  tags?: string[];
  categoryId?: string | null;
}

// 投稿更新入力
// Update post input
export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  categoryId?: string | null;
}

// コメント作成入力
// Create comment input
export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

// Upload Types
// アップロードタイプ
// File upload response
export interface UploadResponse {
  message: string;
  url: string;
}

// Admin Types
// 管理者タイプ
// Admin user list item (flattened profile data)
export interface AdminUserListItem {
  id: string;
  userId: string;
  name: string; // 從profile讀取
  nickname?: string | null; // 從profile讀取
  email: string;
  avatar?: string | null; // 從profile讀取
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date | string;
  _count: {
    posts: number;
    comments: number;
  };
}

// 管理者投稿リスト項目
// Admin post list item
export interface AdminPostListItem {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  createdAt: Date | string;
  user: UserPublic;
  _count: {
    comments: number;
  };
}

// 管理者イベントリスト項目
// Admin event list item
export interface AdminEventListItem {
  id: string;
  name: string;
  fight_date: Date | string;
  status: "PENDING" | "OPEN" | "CLOSED" | "SETTLED" | "CANCELLED";
  sport_type?: SportType | null;
  promoter?: string | null;
  organization?: string | null;
  venue?: string | null;
  location?: string | null;
  createdAt: Date | string;
  _count: {
    fights: number; // 修正：fighterEvents → fights
    bets: number;
    posts: number;
  };
}

// Betting Types
// ベッティングタイプ
// Betting log entry (user bet record)
// Using Prisma-generated type, maintaining backward compatibility
export type BettingLog = PrismaBettingLogFull;

// Betting Odds Interface
// 投注賠率介面 / ベッティングオッズ
// Betting odds calculation result
export interface BettingOdds {
  totalPool: number;
  netPool: number;
  odds: Record<string, number>;
  betsByOutcome: Record<string, number>;
}

// Settle Event Input Interface
// 結算賽事輸入介面 / イベント決済入力
// Input for settling event bets
export interface SettleEventInput {
  winnerId: string;
  winMethod?: string;
  winRound?: number;
}

// External Event Source Types
// 外部イベントソースタイプ
// External API source identifier
export type ExternalEventSource = "thesportsdb" | "espn" | "ufc" | "other";

// Sport Type
// スポーツタイプ
// Combat sport type identifier
export type SportType = "boxing" | "ufc" | "mma" | "other";

// Unified Event Data (from external APIs)
// 統一されたイベントデータ（外部APIから）
// Standardized event data format from external APIs
export interface UnifiedEventData {
  external_id: string;
  name: string;
  fight_date: Date;
  sport_type: SportType;
  external_data: Record<string, unknown>;
  home_team?: string;
  away_team?: string;
  venue?: string;
  league?: string;
  country?: string;
  city?: string;
  status?: string;
}

// Sync Status
// 同期ステータス
// Event synchronization status
export type SyncStatus = "pending" | "syncing" | "completed" | "failed";

// Event Match Result
// 賽事匹配結果 / イベントマッチ結果
// Used for fuzzy matching during event deduplication
export interface EventMatchResult {
  event: Event;
  similarityScore: number;
  matchType: "exact" | "fuzzy";
}

// Merge Event Options
// 合併賽事選項 / イベントマージオプション
// Configuration for merging external API data with existing manual event
export interface MergeEventOptions {
  // Preserve manual fields (do not overwrite)
  // 保留手動欄位（不覆蓋）
  preserveManualFields?: boolean;
  // Update external fields even if they exist
  // 即使存在也更新外部欄位
  forceUpdateExternalFields?: boolean;
  // Minimum similarity score for fuzzy matching
  // 模糊匹配的最小相似度分數
  minSimilarity?: number;
}

// イベントタイプ
// Event type (combat sports event/match)
// Using Prisma-generated type, maintaining backward compatibility
export type Event = PrismaEventPublic;

// Event with fights (from database with relations)
// 包含對戰列表的賽事（從資料庫帶關聯） / 対戦リストを含むイベント
// Event with full fight details and relations
// Using Prisma-generated type, maintaining backward compatibility
export type EventWithFights = PrismaEventWithFights;

// ユーザーベッティング統計
// User betting statistics and performance metrics
export interface UserBettingStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  voided: number;
  totalWagered: number;
  totalPayout: number;
  netProfit: number;
  roi: number; // Return on Investment %
  winRate: number; // Win %
}

// Fighter Types
// 選手類型 / ファイタータイプ
// Fighter type (combat sports athlete)
// Using Prisma-generated type, maintaining backward compatibility
export type Fighter = PrismaFighterFull;

// Fighter for public display (used in components)
// 用於公開顯示的選手類型（用於組件） / 公開表示用ファイター
// Fighter data for public display in components
// Using Prisma-generated type, maintaining backward compatibility
export type FighterPublic = PrismaFighterPublic;

// Fighter with events (from database with relations)
// 包含賽事的選手（從資料庫帶關聯） / イベントを含むファイター
// Fighter with fight history relations
// Using Prisma-generated type, maintaining backward compatibility
export type FighterWithEvents = PrismaFighterWithEvents;

// Fight with event and opponent details
// 包含賽事和對手詳情的 Fight / イベントと対戦相手の詳細を含む対戦
// Fight record with full event and opponent information
// Using Prisma-generated type, maintaining backward compatibility
export type FightWithDetails = PrismaFightWithRelations;
