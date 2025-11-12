import { prisma } from "@/lib/db";
import type { PostWithUser } from "@/lib/types";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/posts/post-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

async function getUserPosts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export default async function UserPostsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserPosts(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/users/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {user.name}'s Posts
        </h1>
        <p className="text-muted-foreground mt-2">
          {user.posts.length} {user.posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {user.posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No posts yet
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.posts.map((post) => (
            <PostCard key={post.id} post={post as PostWithUser} />
          ))}
        </div>
      )}
    </div>
  );
}
