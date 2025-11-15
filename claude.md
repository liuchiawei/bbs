# BBS - Next.js Bulletin Board System

A production-ready bulletin board system (BBS) built with Next.js 16, featuring complete authentication, advanced ISR optimization, admin dashboard, multilingual support, and modern UI/UX.

---

## Claude Code Workflow

IMPORTANT: Follow task-specific workflows optimized for different development scenarios.

### Workflow Selection

Pre-flight checklist before starting any task:

1. Identify task type from branch name or commit type:
   - `feat/*` = Feature Development Workflow
   - `fix/*` = Bug Fix Workflow
   - `refactor/*` = Refactoring Workflow
   - `research/*` = Research Workflow

2. Check git status to understand current branch and changes

3. Set quality bar: Determine difficulty (1-5 stars) to gauge planning depth

### Feature Development Workflow (feat/*)

Use for: New features, major enhancements, architectural changes
Difficulty threshold: 3+ stars
Planning intensity: HIGH

**Phase 1: Deep Planning (BEFORE Any Code)**

Context Gathering:

- ALWAYS read TODO.md (understand planned features and priorities)
- ALWAYS read CHANGELOG.md (learn from similar features)
- Check if task already documented in TODO.md
- Review recent implementations for patterns

Research Best Practices (2-3 targeted web searches):

- When to search:
  - Implementing unfamiliar technology/pattern
  - Security-critical features (auth, payments, data privacy)
  - Performance-critical features (infinite scroll, real-time updates)
  - Breaking changes in frameworks (Next.js 15→16, React 18→19)
  - Complex algorithms (scoring, ranking, search)

- Search query formula: "[Tech + Version] [Feature] [Quality Keywords] [Year]"
  - Good: "Next.js 16 App Router infinite scroll best practices 2025"
  - Good: "React Server Components authentication patterns production"
  - Bad: "how to add button" (too basic)
  - Bad: "javascript loops" (too general)

- What to research:
  - Official documentation (Next.js, React, Prisma, etc.)
  - GitHub community discussions
  - Best practices and anti-patterns
  - Security considerations (OWASP top 10)
  - Performance optimization techniques
  - Real-world implementation examples

Create Implementation Plan (for 3+ star features):

- Create `.claude/plans/[feature-name].md` with sections:
  - Goal: 1-2 sentence description
  - Research Findings: best practices, anti-patterns, security, performance
  - Implementation Steps: numbered with file paths
  - Test Strategy: input/output scenarios
  - Rollback Plan: how to revert if production breaks

- Present plan to user for approval before coding (use ExitPlanMode tool)

**Phase 2: Test-Driven Implementation**

For each sub-task in plan:

1. Write Test First (TDD):
   - Write failing test
   - Implement minimal code to pass
   - Refactor for quality

2. Implement Code:
   - Follow layered architecture (HTTP → Service → Validation → Type)
   - Use existing Prisma select constants
   - Add i18n for all user-facing text
   - TypeScript strict mode compliance
   - Add inline comments for complex logic

3. Incremental Verification (after EACH sub-task):
   - Run `vercel build` for TypeScript check
   - Run `pnpm lint` for linting
   - Manual test affected functionality
   - Verify no console errors

4. Move to Next Sub-task (one at a time, not all at once)

**Phase 3: Documentation & Integration (AFTER Completion)**

Final Verification:

- Run `vercel build` (full TypeScript compilation)
- Run `pnpm lint` (full linting)
- Test all affected API endpoints
- Check for unintended side effects
- Review all changed files

Update Documentation (required for 3+ star features):

- Update CHANGELOG.md with format: date, feat/name, difficulty, description, tasks, achievements
- Update TODO.md: Mark as "已完成（詳細記錄見 CHANGELOG.md）"
- Update CLAUDE.md/README.md if architecture/dependencies/API/deployment changed

Commit with conventional format:

```
feat(scope): description

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Bug Fix Workflow (fix/*)

Use for: Bug fixes, error corrections, minor patches
Difficulty threshold: 2 stars or lower
Planning intensity: LOW

Phase 1: Light Planning

- Read CHANGELOG.md for recent changes (skip TODO.md)
- Identify root cause through code inspection
- Web search ONLY if unfamiliar with technology
- Brief plan: 1-2 sentences describing fix approach

Phase 2: Quick Implementation

- Write failing test that reproduces bug
- Implement minimal fix to pass test
- Check for regression: `vercel build`, `pnpm lint`, test functionality

Phase 3: Light Documentation

- Add inline comments explaining fix
- Update CHANGELOG.md ONLY if significant bug
- Skip TODO.md updates unless bug revealed bigger issue

Commit: `fix(scope): description`

### Refactoring Workflow (refactor/*)

Use for: Code cleanup, performance improvements, architectural changes
Planning intensity: MEDIUM

Phase 1: Minimal Planning

- Read CHANGELOG.md for recent changes
- NO web search needed (internal improvements)
- Define scope clearly (small, focused changes)
- List affected files

Phase 2: Safe Implementation

- Write characterization tests (preserve existing behavior)
- Refactor ONE component at a time
- Make small, focused changes
- Avoid sweeping multi-file refactors
- Incremental verification after EACH change: `vercel build`, `pnpm lint`

Phase 3: Selective Documentation

- Update CHANGELOG.md if major architectural change (3+ stars)
- Update inline comments to reflect new structure
- Update CLAUDE.md if patterns/conventions changed

Commit: `refactor(scope): description`

### Research Workflow (research/*)

Use for: Investigating technologies, evaluating approaches, spike solutions
Planning intensity: VERY HIGH (research only, no implementation)

Phase 1: Extensive Research

- NO file reading or code changes (pure research mode)
- Web Search (4-6 comprehensive searches):
  - Official documentation
  - GitHub community discussions
  - Best practices articles (2025 edition)
  - Anti-patterns and pitfalls
  - Performance benchmarks
  - Security considerations
  - Real-world implementations

Phase 2: Document Findings

- Create `.claude/research/[topic].md`
- Include: Goal, Options Evaluated (pros/cons/performance/security), Recommendation, Rationale, Implementation notes

Phase 3: User Review

- Present findings to user
- Get approval for chosen approach
- If approved, move to Feature Development Workflow for implementation

### Web Search Decision Tree

ALWAYS Search:

- New features not implemented before
- Security-critical implementations (auth, payments, permissions)
- Performance optimization techniques (caching, ISR, database queries)
- Breaking changes in frameworks
- Complex algorithms (search, ranking, scoring)
- Unfamiliar technologies or libraries

SOMETIMES Search:

- Bug fixes in unfamiliar libraries (check docs first)
- Migration strategies
- Debugging complex issues

NEVER Search:

- Refactoring internal code (no external context needed)
- Simple CRUD operations (standard patterns)
- UI tweaks and styling (use existing patterns)
- Documentation updates
- Known patterns already in codebase

### Quality Checklist (All Workflows)

Code Quality:

- Follows layered architecture (HTTP → Service → Validation → Type)
- TypeScript strict mode passes (`vercel build`)
- All user-facing text has i18n translations
- Uses existing Prisma select constants
- Follows codebase naming conventions

Security:

- API endpoints have proper authentication checks
- Input validation with Zod schemas
- No security vulnerabilities (XSS, SQL injection, etc.)
- Sensitive data properly handled

Performance:

- Database queries optimized (no N+1 queries)
- ISR/caching strategies considered
- Component caching utilized where appropriate

Testing:

- Tests written (especially for 3+ star features)
- All tests passing
- Manual testing completed
- No console errors

Documentation:

- Major changes documented in CHANGELOG.md
- TODO.md updated if task from roadmap
- Inline comments for complex logic
- CLAUDE.md/README.md updated if needed

### Common Anti-Patterns to Avoid

Based on 2025 AI-assisted development best practices:

1. "Jump to Code" - Starting to code immediately without planning
   - Solution: Always create implementation plan for 3+ star features
   - Impact: Reduces bugs by 30%

2. "Brand New Hire" - Context loss between work sessions
   - Solution: Maintain session notes in `.claude/session-log.md`
   - Impact: Prevents repeated mistakes

3. "Sweeping Refactor" - Large-scale refactoring causing regressions
   - Solution: Small, focused refactoring with tests
   - Impact: 60% reduction in regression bugs

4. "Documentation Debt" - Over-documenting minor changes creates friction
   - Solution: Use task-specific documentation rules
   - Impact: Faster bug fixes, less overhead

5. "Blind Trust" - Not verifying AI-generated code
   - Solution: Incremental verification after each sub-task
   - Impact: Catches errors 60% earlier

6. "Context Overload" - Reading everything for every task
   - Solution: Task-specific reading (features: both docs, bugs: changelog only)
   - Impact: Faster task initiation

7. "One-Size-Fits-All" - Same workflow for all task types
   - Solution: Use specialized workflows
   - Impact: 10-30% productivity improvement

### Session Learning Log

Create `.claude/session-log.md` to maintain context across sessions:

- Fixed: Brief issue description
- Learned: Key insight to remember
- Convention: Codebase pattern discovered
- Next session: Items for next time

When to update: End of every significant work session
Why: Prevents "brand new hire" problem and maintains continuity

---

## Tech Stack

### Core Framework

- **Next.js 16.0.1** - React framework with App Router
  - React Compiler enabled
  - Component caching enabled
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety with strict mode

### UI & Styling

- **shadcn/ui** - Component library (New York style)
  - 32+ components: Accordion, Alert Dialog, Avatar, Badge, Button, Button Group, Card, Dialog, Dropdown Menu, Field, Form, Glass Surface, Hover Card, Input, Input Group, Label, Pagination, Progress, Select, Separator, Sheet, Skeleton, Sonner, Spinner, Switch, Table, Tabs, Textarea, Timeline, Toggle, Toggle Group, Tooltip
  - Base color: Gray with CSS variables
  - Icon library: Lucide React
  - Custom registries: @aceternity, @react-bits
- **Tailwind CSS 4** - Utility-first CSS framework
  - Custom theme with OKLCH color system
  - Dark mode support (class-based)
  - tw-animate-css for animations
- **Motion 12** (formerly Framer Motion) - Animation library
- **next-themes** - Dark mode management
- **Geist & Geist Mono** - Typography fonts

### Database & ORM

- **Prisma 6.19.0** - Type-safe ORM
  - PostgreSQL database (Neon serverless)
  - 5 Models: User, Post, Comment, PostLike, CommentLike
  - 10 migrations applied
  - Pooled + unpooled connections

### Forms & Validation

- **React Hook Form 7.66.0** - Form state management
- **Zod 4.1.12** - Schema validation
- **@hookform/resolvers 5.2.2** - Integration between RHF and Zod

### Authentication & Security

- **jose 6.1.1** - JWT token generation and verification
- **bcryptjs 3.0.3** - Password hashing
- HTTP-only cookies for secure session storage
- 7-day token expiration

### File Storage

- **@vercel/blob 2.0.0** - Vercel Blob storage for avatars
  - 4MB file size limit
  - Supported formats: JPEG, PNG, GIF, WebP
  - Unique filename generation (timestamp + UUID)

### Development Tools

- **Storybook 10** - Component development environment
  - Vite integration for Next.js
  - Addons: Accessibility (a11y), Docs, Onboarding, Vitest, Chromatic
  - Vitest for component testing
- **Vitest 4** - Testing framework
  - Browser testing with Playwright
  - Coverage with V8
- **ESLint 9** - Code linting
  - Next.js config
  - Storybook plugin
- **Playwright 1.56.1** - Browser testing

### Analytics

- **@vercel/analytics 1.5.0** - Vercel Analytics integration

### UI Utilities

- **class-variance-authority** - Component variant styling
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **sonner** - Toast notifications

## Project Structure

```text
bbs/
├── .claude/                      # Claude Code configuration
├── .storybook/                   # Storybook configuration
│   ├── main.ts
│   ├── preview.ts
│   └── vitest.setup.ts
├── .vercel/                      # Vercel deployment config
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   └── page.tsx
│   ├── api/                      # API routes (HTTP layer)
│   │   ├── admin/                # Admin endpoints (20 total)
│   │   │   ├── posts/
│   │   │   │   ├── [id]/route.ts    # DELETE post by admin
│   │   │   │   └── route.ts         # GET all posts (admin)
│   │   │   └── users/
│   │   │       ├── [id]/
│   │   │       │   ├── ban/route.ts
│   │   │       │   └── unban/route.ts
│   │   │       └── route.ts         # GET all users (admin)
│   │   ├── auth/                 # Authentication
│   │   │   ├── check-userid/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── comments/             # Comment endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── like/route.ts
│   │   │   │   ├── replies/route.ts
│   │   │   │   └── route.ts         # DELETE comment
│   │   │   └── route.ts             # POST comment
│   │   ├── posts/                # Post endpoints
│   │   │   ├── [id]/
│   │   │   │   ├── like/route.ts
│   │   │   │   └── route.ts         # GET, PATCH, DELETE post
│   │   │   └── route.ts             # GET, POST posts
│   │   ├── revalidate/route.ts   # ISR revalidation endpoint
│   │   ├── upload/route.ts       # Vercel Blob upload
│   │   └── user/
│   │       └── [userId]/route.ts # GET, PATCH user
│   ├── event/                    # Event page (placeholder)
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── posts/
│   │   ├── [id]/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── settings/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── user/
│   │   └── [userId]/
│   │       ├── comments/
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── edit/
│   │       │   └── page.tsx
│   │       ├── likes/
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── posts/
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout with Navbar/Footer
│   ├── loading.tsx
│   └── page.tsx                  # Home page (ISR with hot posts)
├── components/
│   ├── admin/                    # Admin components (3)
│   │   ├── admin-tabs.tsx
│   │   ├── post-management.tsx
│   │   └── user-management.tsx
│   ├── auth/                     # Authentication components (2)
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── comments/                 # Comment components (3)
│   │   ├── comment-form.tsx
│   │   ├── comment-item.tsx
│   │   └── delete-comment-button.tsx
│   ├── home/                     # Home components (1)
│   │   └── header.tsx
│   ├── layout/                   # Layout components (2)
│   │   ├── footer.tsx
│   │   └── navbar.tsx
│   ├── posts/                    # Post components (9)
│   │   ├── new-post-button.tsx
│   │   ├── new-post-button-xl.tsx
│   │   ├── post-card.tsx
│   │   ├── post-card-author.tsx
│   │   ├── post-card-footer.tsx
│   │   ├── post-card-header.tsx
│   │   ├── post-delete-button.tsx
│   │   ├── post-form.tsx
│   │   ├── post-like-button.tsx
│   │   └── post-profile-hovercard.tsx
│   ├── profile/                  # Profile components (3)
│   │   ├── avatar-upload.tsx
│   │   ├── edit-profile-form.tsx
│   │   └── profile-card.tsx
│   └── ui/                       # shadcn/ui components (32+)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── button-group.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── GlassSurface.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── input-group.tsx
│       ├── label.tsx
│       ├── pagination.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── timeline.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       └── tooltip.tsx
├── lib/
│   ├── services/                 # Business logic & database operations
│   │   ├── posts.ts              # Post service (includes getHotPosts)
│   │   ├── users.ts              # User service
│   │   └── comments.ts           # Comment service
│   ├── validations.ts            # Zod schemas + Prisma selects
│   ├── types.ts                  # TypeScript type definitions
│   ├── auth.ts                   # JWT authentication utilities
│   ├── constants.ts              # App constants + i18n translations
│   ├── db.ts                     # Prisma client instance
│   └── utils.ts                  # Utility functions
├── prisma/
│   ├── migrations/               # 10 migration files
│   └── schema.prisma             # Database schema (5 models)
├── stories/                      # Storybook stories
├── CHANGELOG.md                  # Development log (Chinese/English)
├── TODO.md                       # Feature roadmap
├── components.json               # shadcn/ui config
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest configuration
└── package.json
```

## Database Schema

### User Model

- **Basic Info**: id (UUID), userId (unique username), name, nickname, email, password (hashed), gender, birthDate, avatar (Vercel Blob URL)
- **Roles**: isAdmin, isBanned
- **Points**: Initial 1000 points per user (ready for future features)
- **Timestamps**: createdAt, updatedAt
- **Relations**: posts, comments, likedPosts (PostLike[]), likedComments (CommentLike[])

### Post Model

- **Basic Info**: id (UUID), title, content, userId (references User.userId), tags (string[])
- **Stats**: views, likes (denormalized counts)
- **Timestamps**: createdAt, updatedAt
- **Relations**: user, comments, likedBy (PostLike[])

### Comment Model

- **Basic Info**: id (UUID), content, userId, postId, parentId (for nested replies)
- **Stats**: likes, replies (denormalized counts)
- **Timestamps**: createdAt, updatedAt
- **Relations**: user (cascade delete), post (cascade delete), likedBy (CommentLike[])

### PostLike Model

- **Fields**: id (UUID), userId, postId, createdAt
- **Constraints**: Unique constraint on (userId, postId)
- **Indexes**: userId, postId
- **Relations**: user (cascade delete), post (cascade delete)

### CommentLike Model

- **Fields**: id (UUID), userId, commentId, createdAt
- **Constraints**: Unique constraint on (userId, commentId)
- **Indexes**: userId, commentId
- **Relations**: user (cascade delete), comment (cascade delete)

## Type System

### Unified User Types

The project uses a unified type system with Prisma select constants:

```typescript
// Core user types
type UserPublic = {
  id: string
  userId: string
  name: string
  nickname: string | null
  avatar: string | null
}

type UserPublicExtended = UserPublic & {
  email: string
}

type UserWithStats = UserPublicExtended & {
  isAdmin: boolean
  isBanned: boolean
  points: number
  createdAt: Date
  updatedAt: Date
  _count: {
    posts: number
    comments: number
    likedPosts: number
    likedComments: number
  }
}

// Prisma select constants
const userSelectPublic = { id: true, userId: true, name: true, nickname: true, avatar: true }
const userSelectPublicExtended = { ...userSelectPublic, email: true }
const userSelectFull = { ...userSelectPublicExtended, isAdmin: true, isBanned: true, points: true, createdAt: true, updatedAt: true }
const userSelectWithStats = { ...userSelectFull, _count: { select: { posts: true, comments: true, likedPosts: true, likedComments: true } } }
```

### Post and Comment Types

```typescript
// Post types with user relations
type PostWithUser = Post & { user: UserPublic }

// Comment types with user relations
type CommentWithUser = Comment & { user: UserPublic }

// Admin list types
type AdminUserListItem = UserWithStats
type AdminPostListItem = Post & { user: UserPublic, _count: { comments: number } }
```

## API Routes (20 Endpoints)

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login (returns JWT in HTTP-only cookie) |
| POST | `/api/auth/logout` | User logout (clears cookie) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/check-userid` | Check userId availability |

### Posts (`/api/posts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts (pagination, filtering) |
| POST | `/api/posts` | Create post (triggers `hot-posts` revalidation) |
| GET | `/api/posts/[id]` | Get single post with comments |
| PATCH | `/api/posts/[id]` | Update post (triggers `hot-posts` revalidation) |
| DELETE | `/api/posts/[id]` | Delete post (triggers `hot-posts` revalidation) |
| POST | `/api/posts/[id]/like` | Toggle like (triggers `hot-posts` revalidation) |

### Comments (`/api/comments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments` | Create comment (triggers `hot-posts` revalidation) |
| DELETE | `/api/comments/[id]` | Delete comment (author/admin only) |
| POST | `/api/comments/[id]/like` | Toggle like |
| GET | `/api/comments/[id]/replies` | Get comment replies |

### Users (`/api/user`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/[userId]` | Get user profile with full stats |
| PATCH | `/api/user/[userId]` | Update user profile (auth required) |

### Admin (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/posts` | Get all posts (admin only) |
| DELETE | `/api/admin/posts/[id]` | Delete any post (admin only) |
| GET | `/api/admin/users` | Get all users (admin only) |
| POST | `/api/admin/users/[id]/ban` | Ban user (admin only) |
| POST | `/api/admin/users/[id]/unban` | Unban user (admin only) |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload avatar to Vercel Blob (4MB max, image formats) |
| POST | `/api/revalidate` | Manual ISR revalidation (secret protected) |

## Package Manager

**IMPORTANT**: This project uses **pnpm** as the package manager.

- Use `pnpm` instead of `npm`
- Use `pnpm dlx` instead of `npx`

## Scripts

```bash
pnpm dev              # Start development server (localhost:3000)
vercel build            # Build for production (runs prisma generate)
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm storybook        # Start Storybook (localhost:6006)
vercel build-storybook  # Build Storybook static site
```

### Database Commands

```bash
pnpm dlx prisma generate        # Generate Prisma client
pnpm dlx prisma migrate dev     # Run migrations (dev)
pnpm dlx prisma migrate deploy  # Deploy migrations (prod)
pnpm dlx prisma studio          # Open Prisma Studio
```

### Common Commands

```bash
# Install dependencies
pnpm install

# Add a package
pnpm add <package-name>

# Add a dev dependency
pnpm add -D <package-name>

# Run one-off commands (replaces npx)
pnpm dlx <command>

# Example: Add shadcn/ui component
pnpm dlx shadcn@latest add <component-name>
```

## Configuration

### Path Aliases

- `@/components` → components directory
- `@/utils` → lib/utils
- `@/ui` → components/ui
- `@/lib` → lib directory
- `@/hooks` → hooks directory

### Architecture

The project follows a **layered architecture pattern**:

- **HTTP Layer** ([app/api/](app/api/)): Handles HTTP requests, authentication, validation, and responses
- **Service Layer** ([lib/services/](lib/services/)): Contains business logic and database operations
- **Validation Layer** ([lib/validations.ts](lib/validations.ts)): Centralized Zod schemas, Prisma selects, and data validation
- **Type Layer** ([lib/types.ts](lib/types.ts)): TypeScript interfaces and types

This separation ensures:

- Code reusability across API routes and Server Components
- Clear separation of concerns
- Easier testing and maintenance
- Better scalability

### Next.js Configuration

```typescript
{
  reactCompiler: true,          // React Compiler enabled
  cacheComponents: true,        // Component caching
}
```

### Theme

- **Light Mode**: OKLCH-based color system with gray base
- **Dark Mode**: Class-based dark variant with custom dark theme colors
- **Border Radius**: 0.625rem base with sm/md/lg/xl variants

### Database

- **PostgreSQL** via Prisma
- **Neon** serverless database (pooled + unpooled connections)
- Connection via `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, etc.

## Internationalization

Supports 4 languages: English (en), Japanese (ja - default), Simplified Chinese (zh-CN), Traditional Chinese (zh-TW)

- Translation Keys: 100+ keys in [lib/constants.ts](lib/constants.ts)
- Helper Function: `t(key, lang)`
- Coverage: All UI text, errors, validation messages

## Features

### Authentication & User Management

- User registration with userId validation and avatar upload
- User login/logout with JWT (HTTP-only cookies, 7-day expiration)
- Session management with secure cookies
- User profile viewing with stats (posts, comments, likes)
- Profile editing (name, gender, birthDate, avatar)
- Avatar upload via Vercel Blob (4MB max, JPEG/PNG/GIF/WebP)
- Public profile pages (/user/[userId])
- User posts list (/user/[userId]/posts)
- User comments list (/user/[userId]/comments)
- User liked content (/user/[userId]/likes)
- User ID availability check (real-time validation)
- Points system (initial 1000 points per user)

### Post Management

- Create post with title, content, tags
- Read posts with pagination
- View single post with comments
- Update post (author/admin only)
- Delete post with cascade (author/admin only)
- Post like/unlike functionality
- Post view tracking (automatic)
- Post statistics (views, likes, comment count)
- Hot posts algorithm (ISR optimized)
- Tags support (comma-separated)

### Comment System

- Create comment on posts
- Nested replies (parentId support)
- Delete comment (author/admin only)
- Comment like/unlike functionality
- Comment statistics (likes count, replies count)
- Get comment replies

### Admin Dashboard

- Admin authentication (isAdmin role check)
- Post Management Tab: View all posts with stats, delete any post, pagination support
- User Management Tab: View all users with stats, ban/unban users, view user details

### ISR & Performance Optimization

- Hot Posts Feature: Score algorithm (likes × 2) + (comments × 1.5) + (views × 0.1) + time decay, 48-hour window, unstable_cache with tags, 60s revalidation
- Revalidation API: Manual cache invalidation via secret token, tag-based and path-based revalidation
- Loading States: Skeleton screens for all major pages
- React Compiler: Enabled for automatic optimizations
- Component Caching: Enabled in Next.js config

### UI/UX Features

- Dark mode support (via next-themes)
- Responsive design (mobile-first)
- Animations (Motion library)
- Toast notifications (Sonner)
- Loading states (Skeleton screens)
- Hover cards (profile preview on username hover)
- Accordion, Dialogs, Dropdown Menus
- Tabs (Admin dashboard navigation)
- Pagination (Post lists)
- Progress bars (Upload progress)
- Timeline (Visual content organization)

### Type Safety & Validation

- Unified Type System: UserPublic, UserPublicExtended, UserWithStats
- Prisma Select Constants: userSelectPublic, userSelectPublicExtended, userSelectFull, userSelectWithStats
- Zod Validation Schemas: registerSchema, loginSchema, postSchema, commentSchema
- TypeScript Strict Mode: Full type coverage

## Environment Variables

### Required Variables

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=***                  # Pooled connection
DATABASE_URL_UNPOOLED=***         # Direct connection
POSTGRES_PRISMA_URL=***
POSTGRES_URL=***
POSTGRES_URL_NON_POOLING=***

# Authentication
JWT_SECRET=***                    # JWT signing secret

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=***

# ISR Revalidation
REVALIDATE_SECRET=***             # Protect revalidation endpoint
```

### Optional Variables

- Neon project details (auto-managed by Vercel)
- PostgreSQL credentials (auto-managed)
- Vercel-specific variables (auto-injected)

## Security

### Implemented

- Password: Bcrypt hashing (10 rounds)
- JWT: HTTP-only cookies, 7-day expiration, SameSite: Lax
- Input Validation: Zod schemas, server-side validation
- File Upload: Type/size validation (4MB max), unique filenames
- API: Auth checks on protected routes, admin role checks, CSRF protection
- Database: Cascade deletes, unique constraints, Prisma ORM (no SQL injection)

### Recommended

- Rate limiting, CORS configuration, CSP headers, HTML sanitization, 2FA

## Deployment

### Production

- Platform: Vercel
- Database: Neon PostgreSQL (serverless)
- Storage: Vercel Blob
- Build: `vercel build` (includes Prisma generate)
- Node: 20.x

Auto-deploy on push to main branch, or manual: `vercel deploy --prod`

## Development Status

### Completed Features

- Database schema with 5 models (User, Post, Comment, PostLike, CommentLike)
- UI component library with 32+ shadcn/ui components
- Development tools configured (Storybook, Vitest, ESLint)
- Authentication system (JWT with HTTP-only cookies)
- User registration and login
- User profile management with stats
- Post CRUD operations
- Comment system with nested replies
- File upload (avatar images via Vercel Blob)
- Like functionality for posts and comments
- Layered architecture with service layer
- Admin dashboard with post/user management
- ISR optimization with hot posts algorithm
- Multilingual support (en, ja, zh-CN, zh-TW)
- Type system unification
- Production deployment on Vercel

### Planned Features

See [TODO.md](TODO.md) for complete roadmap. High priority items:

- Infinite scroll for post lists
- Search feature (full-text search)
- Subscription system (follow/unfollow users)
- Notifications (real-time)
- Post form redesign (top-pinned)
- Profile card components (multiple sizes)

## Testing & Performance

### Testing Setup

- Storybook 10: Component development, a11y testing, visual testing
- Vitest 4: Browser testing with Playwright, V8 coverage
- ESLint 9: Next.js config, Storybook plugin
- TypeScript: Strict mode enabled, full type coverage

### Performance Optimizations

- ISR: 60s revalidation, cache tags, manual revalidation API
- React Compiler: Enabled
- Component Caching: Enabled
- Optimized Queries: Unified Prisma selects
- Database Indexing: PostLike and CommentLike indexed

### Known Limitations

- No database seed script
- i18n using constants (not i18next/next-intl)
- Pagination API ready, UI not implemented
- Timeline and Event page are placeholders

## Recent Updates

See [CHANGELOG.md](CHANGELOG.md) for detailed development history.

### Latest Features (2025-11-16)

- **refactor/unify-user-data-types**: Unified 8 different user data formats into 3 core types with Prisma select constants
- **feat/isr-hot-posts**: Implemented hot posts algorithm with ISR optimization and cache invalidation

## Contributing

This is a personal project. For suggestions or bug reports, please create an issue.

## License

Private project - All rights reserved.
