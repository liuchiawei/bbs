# BBS - Boxing Buddies Society

**Languages / 語言 / 言語**: [English](README.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

A production-ready, modern bulletin board system built with Next.js 16, featuring complete authentication, admin dashboard, multilingual support (4 languages), advanced ISR optimization, and beautiful UI/UX.

## ✨ Features

### Core Features

- ✅ **User Authentication & Profiles**

  - Register with custom username (userId) and avatar upload
  - Login/logout with JWT (HTTP-only cookies, 7-day expiration)
  - Public user profiles with stats (posts, comments, likes)
  - Edit profile (name, gender, birthDate, avatar)
  - View user's posts, comments, and liked content
  - Points system (1000 initial points per user)

- ✅ **Post Management**

  - Create, read, update, delete posts
  - Post with title, content, and tags
  - Like/unlike posts
  - Automatic view tracking
  - Post statistics (views, likes, comment count)
  - **Hot posts algorithm** with ISR optimization

- ✅ **Comment System**

  - Comment on posts
  - Nested replies (unlimited depth)
  - Like/unlike comments
  - Delete comments (author/admin only)
  - Comment statistics (likes count, replies count)

- ✅ **Admin Dashboard**

  - Admin-only access with role check
  - Post management (view all, delete any post)
  - User management (view all, ban/unban users)
  - Pagination support

- ✅ **Advanced Performance**

  - ISR (Incremental Static Regeneration) with 60s revalidation
  - Hot posts algorithm: `(likes × 2) + (comments × 1.5) + (views × 0.1) + time decay`
  - Manual cache invalidation API
  - React Compiler enabled
  - Component caching

- ✅ **Internationalization (i18n)**

  - 4 languages: English, Japanese (default), Simplified Chinese, Traditional Chinese
  - 100+ translation keys
  - All UI text, errors, validation messages translated

- ✅ **Modern UI/UX**
  - 32+ shadcn/ui components (New York style)
  - Dark mode support
  - Responsive design (mobile-first)
  - Smooth animations (Motion library)
  - Toast notifications
  - Loading states (skeleton screens)
  - Hover cards (profile preview)
  - Glassmorphism effects

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.1 (App Router, React 19.2.0, TypeScript 5)
- **Database**: PostgreSQL (Neon serverless) with Prisma ORM 6.19.0
- **UI Library**: shadcn/ui (32+ components) + Tailwind CSS 4
- **Animation**: Motion 12 (Framer Motion successor)
- **Authentication**: JWT (jose) + bcryptjs
- **Forms**: React Hook Form + Zod validation
- **File Storage**: Vercel Blob (avatars, 4MB max)
- **Analytics**: Vercel Analytics
- **Testing**: Storybook 10 + Vitest 4 + Playwright
- **Package Manager**: pnpm

## 📋 Prerequisites

- **Node.js**: 20.x or higher
- **Package Manager**: pnpm (required)
- **Database**: PostgreSQL (or Neon account for serverless)
- **Cloud Storage**: Vercel account (for Blob storage)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bbs
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."              # Pooled connection
DATABASE_URL_UNPOOLED="postgresql://..."     # Direct connection
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# ISR Revalidation (Optional - for manual cache invalidation)
REVALIDATE_SECRET="your-revalidation-secret"
```

#### Getting Database Credentials (Neon)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy all connection strings from the dashboard
4. Paste into `.env.local`

#### Getting Vercel Blob Token

1. Sign up at [vercel.com](https://vercel.com)
2. Create a new project (or link existing)
3. Go to Storage → Blob → Create Blob Store
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 4. Set Up the Database

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Run migrations
pnpm dlx prisma migrate dev

# (Optional) Open Prisma Studio to view database
pnpm dlx prisma studio
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```text
bbs/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (20 endpoints)
│   │   ├── admin/                # Admin endpoints
│   │   ├── auth/                 # Authentication
│   │   ├── comments/             # Comment CRUD
│   │   ├── posts/                # Post CRUD
│   │   ├── user/                 # User profiles
│   │   ├── upload/               # Avatar upload
│   │   └── revalidate/           # ISR revalidation
│   ├── admin/                    # Admin dashboard
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── posts/                    # Post pages
│   ├── user/                     # User profile pages
│   ├── settings/                 # Settings page
│   └── page.tsx                  # Home page (hot posts)
├── components/
│   ├── admin/                    # Admin components (3)
│   ├── auth/                     # Auth forms (2)
│   ├── comments/                 # Comment components (3)
│   ├── posts/                    # Post components (9)
│   ├── profile/                  # Profile components (3)
│   ├── layout/                   # Navbar, Footer (2)
│   └── ui/                       # shadcn/ui components (32+)
├── lib/
│   ├── services/                 # Business logic (posts, users, comments)
│   ├── validations.ts            # Zod schemas + Prisma selects
│   ├── types.ts                  # TypeScript types
│   ├── auth.ts                   # JWT utilities
│   ├── constants.ts              # i18n translations
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utilities
├── prisma/
│   ├── schema.prisma             # Database schema (5 models)
│   └── migrations/               # 10 migration files
├── CLAUDE.md                     # Project documentation (for AI)
├── CHANGELOG.md                  # Development log
├── TODO.md                       # Feature roadmap
└── README.md                     # This file (for users)
```

## 🗄️ Database Schema

### Models

- **User**: id, userId (unique username), name, nickname, email, password, gender, birthDate, avatar, isAdmin, isBanned, points (1000 initial), createdAt, updatedAt
- **Post**: id, title, content, userId, tags[], views, likes, createdAt, updatedAt
- **Comment**: id, content, userId, postId, parentId, likes, replies, createdAt, updatedAt
- **PostLike**: id, userId, postId, createdAt (unique constraint on userId+postId)
- **CommentLike**: id, userId, commentId, createdAt (unique constraint on userId+commentId)

## 🔌 API Endpoints (20 Total)

### Authentication (5 endpoints)

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/api/auth/register`     | Register new user               |
| POST   | `/api/auth/login`        | User login (returns JWT cookie) |
| POST   | `/api/auth/logout`       | User logout (clears cookie)     |
| GET    | `/api/auth/me`           | Get current user                |
| POST   | `/api/auth/check-userid` | Check userId availability       |

### Posts (6 endpoints)

| Method | Endpoint               | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/posts`           | List posts (pagination, filtering) |
| POST   | `/api/posts`           | Create post                        |
| GET    | `/api/posts/[id]`      | Get single post with comments      |
| PATCH  | `/api/posts/[id]`      | Update post (author/admin only)    |
| DELETE | `/api/posts/[id]`      | Delete post (author/admin only)    |
| POST   | `/api/posts/[id]/like` | Toggle like                        |

### Comments (4 endpoints)

| Method | Endpoint                     | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| POST   | `/api/comments`              | Create comment                     |
| DELETE | `/api/comments/[id]`         | Delete comment (author/admin only) |
| POST   | `/api/comments/[id]/like`    | Toggle like                        |
| GET    | `/api/comments/[id]/replies` | Get comment replies                |

### Users (2 endpoints)

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/user/[userId]` | Get user profile with stats |
| PATCH  | `/api/user/[userId]` | Update user profile         |

### Admin (5 endpoints - Admin Only)

| Method | Endpoint                      | Description     |
| ------ | ----------------------------- | --------------- |
| GET    | `/api/admin/posts`            | Get all posts   |
| DELETE | `/api/admin/posts/[id]`       | Delete any post |
| GET    | `/api/admin/users`            | Get all users   |
| POST   | `/api/admin/users/[id]/ban`   | Ban user        |
| POST   | `/api/admin/users/[id]/unban` | Unban user      |

### Utilities (2 endpoints)

| Method | Endpoint          | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| POST   | `/api/upload`     | Upload avatar (4MB max, JPEG/PNG/GIF/WebP)       |
| POST   | `/api/revalidate` | Manual ISR cache invalidation (secret protected) |

## 📝 Available Scripts

### Development

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

### Testing & Documentation

```bash
pnpm storybook        # Start Storybook (localhost:6006)
pnpm build-storybook  # Build Storybook
```

### Database

```bash
pnpm dlx prisma generate        # Generate Prisma client
pnpm dlx prisma migrate dev     # Run migrations (dev)
pnpm dlx prisma migrate deploy  # Deploy migrations (prod)
pnpm dlx prisma studio          # Open Prisma Studio GUI
```

## 🎯 Usage Guide

### Register a New User

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Register" (or "登録" in Japanese)
3. Fill in the form:
   - **User ID**: 1-12 alphanumeric characters (unique username)
   - **Name**: Display name
   - **Email**: Valid email address
   - **Password**: Minimum 8 characters
   - **Gender**: Male/Female/Other (optional)
   - **Birth Date**: Your birth date (optional)
   - **Avatar**: Upload image (optional, 4MB max)
4. Click "Submit"

### Login

1. Click "Login" in the navbar
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to the home page with hot posts

### Create a Post

1. Click the "New Post" button (floating button on the right side)
2. Fill in the form:
   - **Title**: Post title
   - **Content**: Post content (supports multiple lines)
   - **Tags**: Comma-separated tags (e.g., "boxing, training, tips")
3. Click "Submit"
4. Your post will appear on the home page

### Comment on a Post

1. Click on any post card to view the post detail page
2. Scroll down to the comment form
3. Write your comment
4. Click "Post Comment"
5. To reply to a comment, click the "Reply" button on the comment

### Like Posts and Comments

- Click the heart icon (♡) on any post or comment to like it
- Click again to unlike
- The like count updates in real-time

### View Your Profile

1. Click your avatar in the navbar
2. Select "Profile"
3. View your stats:
   - Total posts
   - Total comments
   - Total likes received
   - Points
4. Tabs: Overview, Posts, Comments, Likes

### Edit Your Profile

1. Click your avatar in the navbar
2. Select "Settings"
3. Update your information:
   - Name, Nickname, Gender, Birth Date
   - Upload new avatar
4. Click "Save"

### Admin Dashboard (Admin Only)

1. Login as an admin user (set `isAdmin: true` in database)
2. Navigate to `/admin`
3. **Post Management Tab**:
   - View all posts with stats
   - Delete any post (with confirmation)
4. **User Management Tab**:
   - View all users with stats
   - Ban/unban users

## 🌐 Internationalization (i18n)

The app supports 4 languages:

- **English (en)**
- **Japanese (ja)** - Default
- **Simplified Chinese (zh-CN)**
- **Traditional Chinese (zh-TW)**

To change the language, the app currently uses browser language detection. You can modify the default language in `lib/constants.ts`.

## 🔒 Security Features

- **Password Security**: Bcrypt hashing (10 rounds), no plaintext storage
- **JWT Authentication**: HTTP-only cookies, 7-day expiration, secure flag in production, SameSite: Lax
- **Input Validation**: Zod schemas for all inputs, server-side validation
- **File Upload Security**: Type validation (JPEG/PNG/GIF/WebP only), size limit (4MB), unique filename generation
- **API Security**: Authentication checks on all protected routes, admin role checks, CSRF protection via SameSite cookies
- **Database Security**: Cascade deletes, unique constraints, no SQL injection (Prisma ORM)

## ⚡ Performance Optimizations

- **ISR (Incremental Static Regeneration)**: Home page with 60s revalidation
- **Hot Posts Algorithm**: Intelligent ranking based on engagement and time
- **React Compiler**: Enabled for automatic optimizations
- **Component Caching**: Enabled in Next.js config
- **Optimized Queries**: Unified Prisma selects to reduce over-fetching
- **Database Indexing**: PostLike and CommentLike indexed on userId and postId

## 🚀 Deployment

### Vercel (Recommended)

1. **Prepare Repository**:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:

   - Sign up at [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub/GitLab repository
   - Vercel will auto-detect Next.js
   - Add environment variables (see `.env.local` section)
   - Click "Deploy"

3. **Set Up Database** (if using Neon):

   - Create Neon project
   - Copy connection strings to Vercel environment variables
   - Vercel will auto-run `pnpm build` which includes `prisma generate`

4. **Set Up Blob Storage**:

   - Go to Vercel Dashboard → Storage → Create Blob Store
   - Copy `BLOB_READ_WRITE_TOKEN` to environment variables

5. **Run Migrations**:

   ```bash
   # After first deployment, run migrations
   vercel env pull .env.production
   pnpm dlx prisma migrate deploy
   ```

6. **Create Admin User**:
   - Open Prisma Studio: `pnpm dlx prisma studio`
   - Or use SQL: `UPDATE "User" SET "isAdmin" = true WHERE "email" = 'your@email.com';`

### Manual Deployment

For other platforms (AWS, DigitalOcean, etc.), ensure:

- Node.js 20+ installed
- PostgreSQL database accessible
- Environment variables set
- Run `pnpm build` and `pnpm start`

## 🧪 Testing

### Storybook

```bash
# Start Storybook
pnpm storybook

# Visit http://localhost:6006
```

### Vitest (Future)

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## 🗺️ Roadmap

See [TODO.md](TODO.md) for the complete feature roadmap.

### High Priority

- [ ] Infinite scroll for post lists
- [ ] Search feature (full-text search for posts/users)
- [ ] Profile card components (multiple sizes)

### Medium Priority

- [ ] Subscription system (follow/unfollow users)
- [ ] Notifications (real-time)
- [ ] Post form redesign (top-pinned instead of separate page)

### Future Features

- [ ] Recommendation algorithm (ML-based)
- [ ] Points system features (earn/spend points)
- [ ] Match prediction feature (bet on boxing matches)
- [ ] Rating system for matches and fighters
- [ ] Google OAuth (social login)
- [ ] Full i18n implementation (i18next or next-intl)

## 📖 Documentation

- **CLAUDE.md**: Comprehensive technical documentation for AI assistants
- **CHANGELOG.md**: Development log with detailed feature descriptions
- **TODO.md**: Feature roadmap with difficulty ratings

## 🤝 Contributing

This is a personal project. For suggestions or bug reports, please create an issue.

## 📄 License

Private project - All rights reserved.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI component library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Prisma](https://prisma.io) - ORM
- [Vercel](https://vercel.com) - Hosting and infrastructure
- [Neon](https://neon.tech) - Serverless PostgreSQL

## 📞 Support

For questions or issues, please:

1. Check existing documentation (CLAUDE.md, CHANGELOG.md)
2. Search existing issues
3. Create a new issue with detailed description

---

Built with ❤️ using Next.js 16 and React 19
