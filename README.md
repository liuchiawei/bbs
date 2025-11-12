# BBS - Bulletin Board System

A modern bulletin board system (BBS) built with Next.js 16, featuring user authentication, post management, commenting, and file uploads.

## Features

- ✅ User authentication (register, login, logout)
- ✅ User profile management with avatar upload
- ✅ Create, read, update, delete posts
- ✅ Nested comments with replies
- ✅ Like posts and comments
- ✅ Post categorization and tagging
- ✅ View tracking
- ✅ Responsive design with shadcn/ui
- ✅ Smooth animations with Motion
- ✅ Dark mode support

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS 4
- **Animation**: Motion (Framer Motion)
- **Authentication**: JWT with jose + bcryptjs
- **Forms**: React Hook Form + Zod validation
- **Components**: shadcn/ui (New York style)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database
- pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing

4. Set up the database:

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Run migrations
pnpm dlx prisma migrate dev
```

5. Create the uploads directory:

```bash
mkdir -p public/uploads/avatars
```

6. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
bbs/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post management endpoints
│   │   ├── comments/      # Comment endpoints
│   │   ├── users/         # User management endpoints
│   │   └── upload/        # File upload endpoint
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── posts/             # Post pages (list, detail, create, edit)
│   ├── profile/           # Profile management pages
│   ├── users/             # User profile pages
│   └── layout.tsx         # Root layout with navbar
├── components/            # React components
│   ├── auth/              # Authentication forms
│   ├── posts/             # Post components
│   ├── comments/          # Comment components
│   ├── profile/           # Profile components
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # General utilities
├── prisma/                # Prisma schema and migrations
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── public/                # Static files
    └── uploads/           # Uploaded files
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts (with pagination and filters)
- `POST /api/posts` - Create a post
- `GET /api/posts/[id]` - Get a single post
- `PATCH /api/posts/[id]` - Update a post
- `DELETE /api/posts/[id]` - Delete a post
- `POST /api/posts/[id]/like` - Like a post

### Comments
- `POST /api/comments` - Create a comment
- `DELETE /api/comments/[id]` - Delete a comment
- `POST /api/comments/[id]/like` - Like a comment
- `GET /api/comments/[id]/replies` - Get comment replies

### Users
- `GET /api/users/[id]` - Get user profile
- `PATCH /api/users/[id]` - Update user profile

### Upload
- `POST /api/upload` - Upload avatar image

## Database Schema

### User
- Basic info: id, name, email, password, gender, birthDate, avatar
- Roles: isAdmin, isBanned
- Relations: posts, comments

### Post
- Content: id, title, content, category, tags[]
- Stats: views, likes
- Relations: user, comments

### Comment
- Content: id, content, parentId (for nested replies)
- Stats: likes, replies
- Relations: user, post

## Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm storybook        # Start Storybook
pnpm build-storybook  # Build Storybook
```

## Usage

### Register a New User
1. Click "Register" in the navbar
2. Fill in the registration form
3. Upload an avatar (optional)
4. Submit the form

### Create a Post
1. Login to your account
2. Click "New Post" in the navbar
3. Fill in the post form with title, content, category, and tags
4. Submit the post

### Comment on a Post
1. Navigate to a post detail page
2. Write your comment in the comment form
3. Click "Post Comment"
4. Reply to other comments by clicking the "Reply" button

### Like Posts and Comments
- Click the heart icon on any post or comment to like it

### Edit Your Profile
1. Click your avatar in the navbar
2. Select "Settings"
3. Update your profile information
4. Upload a new avatar if desired
5. Save changes

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies for session management
- Input validation with Zod
- File upload validation (type, size)
- CSRF protection via SameSite cookies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
