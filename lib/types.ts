// Category Types
export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CategoryWithCount extends Category {
  _count: {
    posts: number;
  };
}

// User Types
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserWithCounts extends User {
  _count?: {
    posts: number;
    comments: number;
  };
}

export interface UserProfilePage extends User {
  posts: PostWithUser[];
  _count: {
    posts: number;
    comments: number;
    likedPosts: number;
    likedComments: number;
  };
}

// Post Types
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  categoryId: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PostWithUser extends Post {
  user: {
    id: string;
    userId: string;
    name: string;
    nickname?: string | null;
    avatar?: string | null;
  };
  category: {
    id: string;
    slug: string;
    name: string;
  };
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
  user: {
    id: string;
    userId: string;
    name: string;
    nickname?: string | null;
    avatar?: string | null;
  };
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
  categoryId: string;
  tags?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  categoryId?: string;
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
  categoryId: string;
  views: number;
  likes: number;
  createdAt: Date | string;
  user: {
    id: string;
    userId: string;
    name: string;
    nickname?: string | null;
    avatar?: string | null;
  };
  category: {
    id: string;
    slug: string;
    name: string;
  };
  _count: {
    comments: number;
  };
}

export interface AdminCategoryForm {
  slug: string;
  name: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}
