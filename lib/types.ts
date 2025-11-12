// User Types
export interface User {
  id: string;
  name: string;
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

// Post Types
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PostWithUser extends Post {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
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
    name: string;
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
  name: string;
  email: string;
  password: string;
  gender?: string;
  birthDate?: string;
}

export interface LoginInput {
  email: string;
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
  category: string;
  tags?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  category?: string;
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
