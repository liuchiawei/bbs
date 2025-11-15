// User Types
// 完整使用者資料（所有欄位）
export interface User {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  email: string;
  gender?: string | null;
  birthDate?: Date | string | null;
  avatar?: string | null;
  isAdmin?: boolean;
  isBanned?: boolean;
  points?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// 公開顯示用使用者資料（不包含敏感資訊）
export interface UserPublic {
  id: string;
  userId: string;
  name: string;
  nickname?: string | null;
  avatar?: string | null;
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
export interface UserProfilePage extends User {
  posts: Post[];
  _count: UserStats;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PostWithUser extends Post {
  user: UserPublicExtended;
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
  name: string;
  nickname?: string;
  email: string;
  password: string;
  gender?: string;
  birthDate?: string;
}

export interface LoginInput {
  userId: string;
  password: string;
}

// Form Types
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
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
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
  name: string;
  nickname?: string | null;
  email: string;
  avatar?: string | null;
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
