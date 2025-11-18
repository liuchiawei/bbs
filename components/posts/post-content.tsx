"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PostLikeButton } from "@/components/posts/post-like-button";
import { PostDeleteButton } from "@/components/posts/post-delete-button";
import { PostEditForm } from "@/components/posts/post-edit-form";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { MessageCircle, Eye, Edit } from "lucide-react";
import { t } from "@/lib/constants";

interface PostContentProps {
  post: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    views: number;
    likes: number;
    createdAt: string;
    user: {
      id: string;
      userId: string;
      name: string;
      nickname?: string | null;
      avatar: string | null;
    };
    comments: Array<{
      id: string;
      content: string;
      likes: number;
      replies: number;
      createdAt: string;
      userId: string;
      postId: string;
      parentId: string | null;
      user: {
        id: string;
        userId: string;
        name: string;
        nickname?: string | null;
        avatar: string | null;
      };
    }>;
    _count: {
      comments: number;
    };
  };
  currentUserId?: string;
  postId: string;
}

export function PostContent({
  post,
  currentUserId,
  postId,
}: PostContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const isOwner = currentUserId === post.user.id;

  // ユーザーが投稿にいいねをしているかチェック
  // Check if user has liked the post
  useEffect(() => {
    if (!currentUserId) {
      setIsLiked(false);
      return;
    }

    fetch(`/api/posts/${postId}/like`)
      .then((res) => res.json())
      .then((data) => setIsLiked(data.isLiked))
      .catch(() => setIsLiked(false));
  }, [currentUserId, postId]);

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.user.userId}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.avatar || undefined} />
              <AvatarFallback>
                {post.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/user/${post.user.userId}`}
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
          {isOwner && !isEditing && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("EDIT")}</TooltipContent>
              </Tooltip>
              <PostDeleteButton postId={post.id} />
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <PostEditForm
          postId={post.id}
          initialTitle={post.title}
          initialContent={post.content}
          initialTags={post.tags}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
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

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span>
                {post.views} {t("VIEWS")}
              </span>
            </div>
            <PostLikeButton
              postId={post.id}
              initialLikes={post.likes}
              initialIsLiked={isLiked}
              isAuthenticated={!!currentUserId}
            />
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span>
                {post._count.comments} {t("COMMENTS").toLowerCase()}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t("COMMENTS")}</h2>

            {currentUserId ? (
              <CommentForm postId={post.id} />
            ) : (
              <div className="text-center py-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  <Link
                    href="/login"
                    className="text-primary hover:underline"
                  >
                    {t("LOGIN")}
                  </Link>{" "}
                  {t("LOGIN_TO_COMMENT")}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("NO_COMMENTS_BE_FIRST")}
                </p>
              ) : (
                post.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={{
                      ...comment,
                      updatedAt: comment.createdAt,
                      user: {
                        ...comment.user,
                        email: "",
                      },
                    }}
                    postId={post.id}
                    currentUserId={currentUserId}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

