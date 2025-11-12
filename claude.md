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
  - Custom output directory: `app/generated/prisma`
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
│   ├── generated/prisma/      # Prisma client output
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   └── ui/                     # shadcn/ui components
├── lib/
│   └── utils.ts                # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
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

The project is currently in initial setup phase with:

- ✅ Database schema defined
- ✅ UI component library installed
- ✅ Development tools configured
- ⏳ Authentication implementation pending
- ⏳ Post management UI pending
- ⏳ Comment system UI pending
