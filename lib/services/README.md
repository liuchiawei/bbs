# Services Layer Documentation

This directory contains centralized business logic and database operations used throughout the application.

## Structure

```
lib/
├── services/
│   ├── posts.ts      # Post-related database operations
│   ├── users.ts      # User-related database operations
│   └── comments.ts   # Comment-related database operations
├── validations.ts    # Zod validation schemas
├── auth.ts           # Authentication utilities
├── db.ts             # Prisma client instance
└── types.ts          # TypeScript type definitions
```

## Purpose

The `lib/services` directory separates business logic and data access from API routes and pages, providing:

- **Single Source of Truth**: All database queries in one place
- **Reusability**: Functions can be used across multiple routes/pages
- **Type Safety**: All functions properly typed with TypeScript
- **Maintainability**: Easy to update database logic in one location

## Usage

### In API Routes (`app/api/`)

API routes handle HTTP requests, validation, and authorization, then call functions from `lib/services`:

```typescript
// app/api/posts/route.ts
import { getPosts, createPost } from "@/lib/services/posts";
import { getSession } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data = createPostSchema.parse(body);

  const post = await createPost(session.userId, data);
  return NextResponse.json({ post });
}
```

### In Server Components (`app/`)

Server components can directly import and use these functions:

```typescript
// app/page.tsx
import { getPosts } from "@/lib/services/posts";

export default async function Home() {
  const posts = await getPosts({ category: "tech", limit: 10 });
  return <div>{/* render posts */}</div>;
}
```

## API Reference

### Posts (`lib/services/posts.ts`)

#### Read Operations

- `getPosts(options?)` - Get list of posts with filtering and pagination
- `getPostById(id)` - Get single post with full details
- `getPostsCount(options?)` - Get total count for pagination

#### Write Operations

- `createPost(userId, data)` - Create a new post
- `updatePost(id, data)` - Update existing post
- `deletePost(id)` - Delete a post
- `incrementPostViews(id)` - Increment view count
- `incrementPostLikes(id)` - Increment like count

### Users (`lib/services/users.ts`)

#### Read Operations

- `getUserById(id)` - Get basic user data
- `getUserWithCounts(id)` - Get user with post/comment counts
- `getUserProfile(userId)` - Get profile data for settings

#### Write Operations

- `updateUserProfile(userId, data)` - Update user profile

### Comments (`lib/services/comments.ts`)

#### Read Operations

- `getCommentsByPostId(postId)` - Get top-level comments for a post
- `getCommentReplies(commentId)` - Get replies for a comment
- `getCommentById(id)` - Get single comment

#### Write Operations

- `createComment(userId, data)` - Create a new comment
- `deleteComment(id)` - Delete comment and its replies
- `incrementCommentLikes(id)` - Increment like count
- `incrementCommentReplies(parentId)` - Increment reply count
- `decrementCommentReplies(parentId)` - Decrement reply count

## Validation Schemas (`lib/validations.ts`)

All Zod validation schemas are centralized in `lib/validations.ts`:

- **Auth**: `registerSchema`, `loginSchema`
- **Users**: `updateUserSchema`
- **Posts**: `createPostSchema`, `updatePostSchema`
- **Comments**: `createCommentSchema`

## Best Practices

1. **Always use these functions** instead of direct Prisma queries in routes/pages
2. **Validate input** using schemas from `lib/validations.ts`
3. **Check authorization** in API routes before calling write operations
4. **Handle errors** appropriately in API routes
5. **Keep functions focused** - each function should do one thing well

## Example: Complete Flow

```typescript
// 1. Validation Schema (lib/validations.ts)
export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

// 2. Service Function (lib/services/posts.ts)
export async function createPost(userId: string, data: CreatePostInput) {
  return await prisma.post.create({
    data: { ...data, userId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });
}

// 3. API Route (app/api/posts/route.ts)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data = createPostSchema.parse(body);

  const post = await createPost(session.userId, data);
  return NextResponse.json({ message: "Post created", post });
}

// 4. Server Component (app/page.tsx)
const posts = await getPosts({ category: "tech" });
```

This layered approach ensures clean separation of concerns and maintainable code.
