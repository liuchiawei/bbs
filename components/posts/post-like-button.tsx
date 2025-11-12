"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostLikeButtonProps {
  postId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  isAuthenticated: boolean;
}

export function PostLikeButton({
  postId,
  initialLikes,
  initialIsLiked,
  isAuthenticated,
}: PostLikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const router = useRouter();

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to like posts");
      router.push("/login");
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to toggle like");
      }

      setLikes(result.likes);
      setIsLiked(result.isLiked);
      toast.success(result.isLiked ? "Post liked!" : "Post unliked!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={isLiking}
      className="gap-2 -ml-2"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : ""
        }`}
      />
      <span>{likes} likes</span>
    </Button>
  );
}
