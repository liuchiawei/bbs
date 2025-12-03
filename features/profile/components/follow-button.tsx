"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // If initialIsFollowing is not provided (e.g. undefined), we could fetch it.
  // But for now, we rely on the parent passing it or we fetch it on mount if needed.
  // To keep it simple and performant, we'll assume the parent might pass it, 
  // or we fetch it if we want to be sure.
  useEffect(() => {
    if (initialIsFollowing === undefined) {
      fetch(`/api/users/${targetUserId}/follow`)
        .then((res) => res.json())
        .then((data) => {
          if (data.isFollowing !== undefined) {
            setIsFollowing(data.isFollowing);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [targetUserId, initialIsFollowing]);

  const handleToggleFollow = async () => {
    setIsLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed user" : "Followed user");
      router.refresh(); // Refresh to update counts
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={handleToggleFollow}
      disabled={isLoading}
      className={isFollowing ? "text-muted-foreground hover:text-destructive hover:border-destructive" : ""}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 mr-2" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
