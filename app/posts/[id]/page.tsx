import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { hasUserLikedPost } from "@/lib/services/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { PostLikeButton } from "@/components/posts/post-like-button";
import { MessageCircle, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return post;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  const session = await getSession();

  if (!post) {
    notFound();
  }

  const isOwner = session?.userId === post.user.id;
  const isLiked = session ? await hasUserLikedPost(session.userId, post.id) : false;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/users/${post.user.id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.user.avatar || undefined} />
                  <AvatarFallback>
                    {post.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  href={`/users/${post.user.id}`}
                  className="font-medium hover:underline"
                >
                  {post.user.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge>{post.category}</Badge>
              {isOwner && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/posts/${post.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span>{post.views} views</span>
            </div>
            <PostLikeButton
              postId={post.id}
              initialLikes={post.likes}
              initialIsLiked={isLiked}
              isAuthenticated={!!session}
            />
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>{post._count.comments} comments</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Comments</h2>

            {session ? (
              <CommentForm postId={post.id} />
            ) : (
              <div className="text-center py-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Login
                  </Link>{" "}
                  to comment
                </p>
              </div>
            )}

            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    currentUserId={session?.userId}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
