"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { CommentForm } from "./comment-form";
import type { CommentWithUser } from "@/lib/types";

interface CommentItemProps {
  comment: CommentWithUser;
  postId: string;
  currentUserId?: string;
  onDelete?: () => void;
  level?: number;
  rootCommentId?: string;
  onReplyAdded?: () => void;
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
  onDelete,
  level = 0,
  rootCommentId,
  onReplyAdded,
}: CommentItemProps) {
  const router = useRouter();
  const [likes, setLikes] = useState(comment.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // For level 0 comments, they are the root. For level 1, use the passed rootCommentId
  const effectiveRootId = level === 0 ? comment.id : rootCommentId;

  // Fetch initial like status
  useEffect(() => {
    fetch(`/api/comments/${comment.id}/like`)
      .then((res) => res.json())
      .then((data) => setIsLiked(data.isLiked))
      .catch(() => setIsLiked(false));
  }, [comment.id]);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to like comment");
      }

      setLikes(result.likes);
      setIsLiked(result.isLiked);
      toast.success(result.isLiked ? "Comment liked!" : "Comment unliked!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to like comment"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete comment");
      }

      toast.success("Comment deleted!");
      onDelete?.();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    }
  };

  const loadReplies = () => {
    if (level === 0) {
      fetch(`/api/comments/${comment.id}/replies`)
        .then((res) => res.json())
        .then((result) => {
          if (result.replies) {
            setReplies(result.replies);
          }
        })
        .catch(() => {
          toast.error("Failed to load replies");
        });
    }
  };

  useEffect(() => {
    if (comment.replies > 0 && level === 0) {
      loadReplies();
    }
  }, [comment.id, comment.replies, level, reloadTrigger]);

  const isOwner = currentUserId === comment.user.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? "ml-8 border-l-2 pl-4" : ""}`}
    >
      <div className="flex gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
        <Link href={`/users/${comment.user.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.user.avatar || undefined} />
            <AvatarFallback>
              {comment.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${comment.user.id}`}
              className="hover:underline"
            >
              {comment.user.name}
            </Link>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
              {new Date(comment.createdAt).toLocaleTimeString()}
            </span>
          </div>

          <p className="text-sm">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className="h-8 gap-1"
                >
                  <Heart
                    className={`h-3 w-3 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span className="text-xs">{likes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLiked ? "Unlike" : "Like"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(!showReplyForm);
                  }}
                  className="h-8 gap-1"
                >
                  <MessageCircle className="h-3 w-3" />
                  {comment.replies > 0 && (
                    <span className="text-xs">{comment.replies}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>

            {isOwner && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={effectiveRootId}
                onSuccess={() => {
                  setShowReplyForm(false);
                  if (level === 0) {
                    // If this is a root comment, reload its replies
                    setReloadTrigger((prev) => prev + 1);
                  } else if (onReplyAdded) {
                    // If this is a reply, tell the root to reload
                    onReplyAdded();
                  }
                }}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              level={1}
              rootCommentId={comment.id}
              onDelete={onDelete}
              onReplyAdded={() => setReloadTrigger((prev) => prev + 1)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
