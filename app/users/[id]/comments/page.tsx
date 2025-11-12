import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

async function getUserComments(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export default async function UserCommentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserComments(id);

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
          {user.name}'s Comments
        </h1>
        <p className="text-muted-foreground mt-2">
          {user.comments.length} {user.comments.length === 1 ? "comment" : "comments"}
        </p>
      </div>

      {user.comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No comments yet
        </p>
      ) : (
        <div className="space-y-4">
          {user.comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      href={`/users/${comment.user.id}`}
                      className="font-semibold hover:underline"
                    >
                      {comment.user.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      on{" "}
                      <Link
                        href={`/posts/${comment.post.id}`}
                        className="hover:underline"
                      >
                        {comment.post.title}
                      </Link>
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span>{comment.likes} likes</span>
                  <span>{comment.replies} replies</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
