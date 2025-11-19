// Profile Visibility Types
export type ProfileVisibility = "public" | "friends" | "private";

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
export interface Profile {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  gender?: string | null;
  birthDate?: Date | string | null;
  avatar?: string | null;
  height?: number | null;
  weight?: number | null;
  description?: string | null;
  record?: string | null;
  train_start?: number | null;
  stance?: string | null;
  gym?: string | null;
  visibility: ProfileVisibilitySettings;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProfilePublic {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  avatar?: string | null;
}

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

export interface UpdateVisibilityInput {
  visibility: ProfileVisibilitySettings;
}

// User Types
// User簡化（僅登錄相關）
export interface User {
  id: string;
  userId: string;
  email: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  points?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  profile?: Profile | null;
}

// User + Profile組合類型（最常用）
export interface UserWithProfile extends User {
  profile: Profile;
}

// 公開顯示用使用者資料（從Profile讀取顯示資料）
// 注意：nickname 和 avatar 嚴格為 string | null（不允許 undefined）
// Note: nickname and avatar are strictly string | null (undefined not allowed)
export interface UserPublic {
  id: string;
  userId: string;
  name: string; // 從profile.name讀取
  nickname: string | null; // 從profile.nickname讀取（null 表示未設定）
  avatar: string | null; // 從profile.avatar讀取（null 表示未設定）
}

// 公開顯示用使用者資料（擴展版，包含 email）
export interface UserPublicExtended extends UserPublic {
  email: string;
}

// 使用者統計資料
export interface UserStats {
  posts: number;
  comments: number;
  likedPosts: number;
  likedComments: number;
}

// 完整使用者資料 + 統計
export interface UserWithStats extends User {
  _count: UserStats;
}

// 使用者資料 + 基本統計（用於向後兼容）
export interface UserWithCounts extends User {
  _count?: {
    posts: number;
    comments: number;
    likedPosts?: number;
    likedComments?: number;
  };
}

// 使用者個人資料頁（包含最近貼文和完整統計）
export interface UserProfilePage extends UserWithProfile {
  posts: Post[];
  _count: UserStats;
}

// User + Profile + 統計
export interface UserWithProfileAndStats extends UserWithProfile {
  _count: UserStats;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  displayOrder: number; // 表示順序 / Display order
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null; // ソフトデリート用のタイムスタンプ / Soft delete timestamp
}

// Post Types
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  categoryId?: string | null;
  views: number;
  likes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null; // ソフトデリート用のタイムスタンプ / Soft delete timestamp
}

export interface PostWithUser extends Post {
  user: UserPublicExtended;
  category?: Category | null;
  _count: {
    comments: number;
  };
}

export interface PostWithDetails extends PostWithUser {
  comments: CommentWithUser[];
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  userId: string;
  postId: string;
  parentId?: string | null;
  likes: number;
  replies: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null; // ソフトデリート用のタイムスタンプ / Soft delete timestamp
}

export interface CommentWithUser extends Comment {
  user: UserPublicExtended;
}

// API Response Types
export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface SessionPayload {
  userId: string;
  email: string;
}

export interface RegisterInput {
  userId: string;
  email: string;
  password: string;
}

export interface LoginInput {
  userId: string;
  password: string;
}

// Form Types (deprecated - use UpdateProfileInput instead)
export interface EditProfileInput {
  name?: string;
  gender?: string | null;
  birthDate?: string | null;
  avatar?: string | null;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tags?: string[];
  categoryId?: string | null;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  categoryId?: string | null;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

// Upload Types
export interface UploadResponse {
  message: string;
  url: string;
}

// Admin Types
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
