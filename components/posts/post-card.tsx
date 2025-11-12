"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useState } from "react";
import type { PostWithUser } from "@/lib/types";

interface PostCardProps {
  post: PostWithUser;
}

export function PostCard({ post }: PostCardProps) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
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
      toast.success("Post liked!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to like post"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const contentPreview =
    post.content.length > 150
      ? post.content.substring(0, 150) + "..."
      : post.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="flex items-center justify-between">
          <h1 className="text-2xl md:text-4xl font-bold">
            {post.title.length > 12 // truncate title to 12 characters
              ? post.title.substring(0, 12) + "..."
              : post.title}
          </h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/users/${post.user.id}`}>
                <Avatar className="size-10">
                  <AvatarImage src={post.user.avatar || undefined} />
                  <AvatarFallback>
                    {post.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent>{post.user.name}</TooltipContent>
          </Tooltip>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {contentPreview.length > 25 // truncate content to 25 characters
              ? contentPreview.substring(0, 25) + "..."
              : contentPreview}
          </p>

          <div className="flex items-center justify-between pt-4 border-t gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className="gap-1"
              >
                <Heart
                  className={`size-4 ${
                    likes > post.likes ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{likes}</span>
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="size-4" />
                <span>{post._count.comments}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/posts/${post.id}`}
                className="text-sm text-right"
              >
                <Eye className="size-4" />
                <span className="ml-1">See more</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
