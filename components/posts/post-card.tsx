"use client";

import Link from "next/link";
import PostCardHeader from "@/components/posts/post-card-header";
import PostCardFooter from "@/components/posts/post-card-footer";
import PostCardAuthor from "@/components/posts/post-card-author";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { PostWithUser } from "@/lib/types";
import { APP_CONSTANTS, t } from "@/lib/constants";
import { User } from "@/lib/types";

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // コンポーネントがマウントされた時に、ユーザーのログイン状態とisLiked状態をチェック
  // Check user authentication and isLiked status when component mounts
  useEffect(() => {
    const checkAuthAndLikeStatus = async () => {
      try {
        // ユーザーのログイン状態をチェック
        // Check if user is authenticated
        const authResponse = await fetch("/api/auth/me");
        if (authResponse.ok) {
          const authData = await authResponse.json();
          if (authData.user) {
            setIsAuthenticated(true);
            // ログイン中の場合は、isLiked状態を取得
            // If logged in, fetch isLiked status
            const likeResponse = await fetch(`/api/posts/${post.id}/like`);
            if (likeResponse.ok) {
              const likeData = await likeResponse.json();
              setIsLiked(likeData.isLiked);
              setLikes(likeData.likes);
            } else if (likeResponse.status === 401) {
              // 401エラーの場合は、ログインしていないとみなす
              // 401 error means user is not authenticated
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        // エラーが発生した場合は、ログインしていないとみなす
        // If error occurs, assume user is not logged in
        // ログインしていない場合のエラーは無視する
        // Ignore errors when user is not logged in
      }
    };

    checkAuthAndLikeStatus();
  }, [post.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like posts");
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to like post");
      }

      setLikes(result.likes);
      setIsLiked(result.isLiked);
      toast.success(result.isLiked ? "Post liked!" : "Post unliked!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to like post"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const contentPreview =
    post.content.length > APP_CONSTANTS.CONTENT_PREVIEW_LENGTH
      ? post.content.substring(0, APP_CONSTANTS.CONTENT_PREVIEW_LENGTH) + "..."
      : post.content;

  return (
    <Card className="hover:shadow-lg">
      <CardContent className="flex space-x-4 space-y-1">
        <PostCardHeader />
        <Link href={`/posts/${post.id}`} className="flex-1 flex flex-col gap-1">
          <h2 className="text-lg md:text-xl font-semibold">{post.title}</h2>
          <p className="text-muted-foreground">{contentPreview}</p>
          {/* TODO: See More Button */}
          {/* <Button variant="link" className="text-xs" asChild>
              <Link href={`/posts/${post.id}`}>{t("SEE_MORE")}</Link>
            </Button> */}
        </Link>
      </CardContent>
      <PostCardFooter
        post={post}
        handleLike={handleLike}
        isLiking={isLiking}
        likes={likes}
        isLiked={isLiked}
      />
    </Card>
  );
}
