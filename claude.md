# BBS - Next.js Bulletin Board System

A modern bulletin board system (BBS) built with Next.js 16, featuring a complete user authentication system, post management, and commenting functionality.

## Tech Stack

### Core Framework

- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### UI & Styling

- **shadcn/ui** - Component library (New York style)
  - Components: Alert Dialog, Avatar, Badge, Button, Card, Form, Input, Progress, Separator, Skeleton, Spinner, Tooltip, Pagination, Sheet
  - Base color: Gray with CSS variables
  - Icon library: Lucide React
- **Tailwind CSS 4** - Utility-first CSS framework
  - Custom theme with OKLCH color system
  - Dark mode support
  - tw-animate-css for animations
- **Motion 12** (formerly Framer Motion) - Animation library
- **next-themes** - Dark mode management
- **Geist & Geist Mono** - Typography fonts

### Database & ORM

- **Prisma** - Type-safe ORM
  - PostgreSQL database
  - Models: User, Post, Comment

### Forms & Validation

- **React Hook Form** - Form state management
- **Zod 4** - Schema validation
- **@hookform/resolvers** - Integration between RHF and Zod

### Development Tools

- **Storybook 10** - Component development environment
  - Vite integration for Next.js
  - Addons: Accessibility (a11y), Docs, Onboarding, Vitest
  - Vitest for component testing
- **Vitest 4** - Testing framework
  - Browser testing with Playwright
  - Coverage with V8
- **ESLint 9** - Code linting
  - Next.js config
  - Storybook plugin

### UI Utilities

- **class-variance-authority** - Component variant styling
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **sonner** - Toast notifications

## Project Structure

```text
bbs/
├── app/
│   ├── api/                    # API routes (HTTP layer)
│   │   ├── auth/               # Authentication endpoints
│   │   ├── posts/              # Post endpoints
│   │   ├── users/              # User endpoints
│   │   ├── comments/           # Comment endpoints
│   │   └── upload/             # File upload endpoint
│   ├── posts/                  # Post pages
│   ├── users/                  # User profile pages
│   ├── settings/               # User settings page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── auth/                   # Authentication components
│   ├── posts/                  # Post components
│   ├── comments/               # Comment components
│   ├── profile/                # Profile components
│   └── layout/                 # Layout components (navbar, footer)
├── lib/
│   ├── services/               # Business logic & database operations
│   │   ├── posts.ts            # Post service
│   │   ├── users.ts            # User service
│   │   └── comments.ts         # Comment service
│   ├── validations.ts          # Zod validation schemas
│   ├── types.ts                # TypeScript type definitions
│   ├── auth.ts                 # Authentication utilities
│   ├── db.ts                   # Prisma client instance
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── public/
│   └── uploads/                # User uploaded files (gitignored)
├── stories/                    # Storybook stories
├── .storybook/                 # Storybook configuration
├── components.json             # shadcn/ui config
└── package.json
```

## Database Schema

### User Model

- **Basic Info**: id, name, email, password, gender, birthDate, avatar
- **Roles**: isAdmin, isBanned
- **Timestamps**: createdAt, updatedAt
- **Relations**: posts, comments

### Post Model

- **Basic Info**: id, title, content, userId, category, tags[]
- **Stats**: views, likes
- **Timestamps**: createdAt, updatedAt
- **Relations**: user, comments

### Comment Model

- **Basic Info**: id, content, userId, postId, parentId (for nested comments)
- **Stats**: likes, replies
- **Timestamps**: createdAt, updatedAt
- **Relations**: user, post

## Package Manager

**IMPORTANT**: This project uses **pnpm** as the package manager.

- Use `pnpm` instead of `npm`
- Use `pnpm dlx` instead of `npx`

## Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production (runs prisma generate)
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm storybook        # Start Storybook dev server
pnpm build-storybook  # Build Storybook
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

The project follows a layered architecture pattern:

- **HTTP Layer** (`app/api/`): Handles HTTP requests, authentication, validation, and responses
- **Service Layer** (`lib/services/`): Contains business logic and database operations
- **Validation Layer** (`lib/validations.ts`): Centralized Zod schemas for data validation
- **Type Layer** (`lib/types.ts`): TypeScript interfaces and types

This separation ensures:
- Code reusability across API routes and Server Components
- Clear separation of concerns
- Easier testing and maintenance
- Better scalability

### Theme

- **Light Mode**: OKLCH-based color system with gray base
- **Dark Mode**: Automatic dark variant with custom dark theme colors
- **Border Radius**: 0.625rem base with sm/md/lg/xl variants

### Database

- PostgreSQL via Prisma
- Connection via `DATABASE_URL` environment variable

## Features

- ✅ Modern UI with shadcn/ui components
- ✅ Dark mode support
- ✅ Type-safe database operations with Prisma
- ✅ Form validation with Zod
- ✅ Animation support with Motion
- ✅ Component testing with Vitest
- ✅ Component documentation with Storybook
- ✅ Responsive design with Tailwind CSS
- ✅ User authentication system ready
- ✅ Post and comment management system
- ✅ Nested comments support

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string

## Development Status

- ✅ Database schema defined
- ✅ UI component library installed
- ✅ Development tools configured
- ✅ Authentication system implemented (JWT with HTTP-only cookies)
- ✅ User registration and login
- ✅ User profile management
- ✅ Post CRUD operations
- ✅ Comment system with nested replies
- ✅ File upload (avatar images)
- ✅ Like functionality for posts and comments
- ✅ Layered architecture with service layer
