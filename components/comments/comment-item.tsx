"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
  onDelete,
  level = 0,
}: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);

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
      toast.success("Comment liked!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to like comment");
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment");
    }
  };

  const loadReplies = async () => {
    if (repliesLoaded) {
      setShowReplies(!showReplies);
      return;
    }

    try {
      const response = await fetch(`/api/comments/${comment.id}/replies`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load replies");
      }

      setReplies(result.replies);
      setRepliesLoaded(true);
      setShowReplies(true);
    } catch (error) {
      toast.error("Failed to load replies");
    }
  };

  const isOwner = currentUserId === comment.user.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? "ml-8 border-l-2 pl-4" : ""}`}
    >
      <div className="flex gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.user.avatar || undefined} />
          <AvatarFallback>
            {comment.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.user.name}</span>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="h-8 gap-1"
            >
              <Heart className={`h-3 w-3 ${likes > comment.likes ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs">{likes}</span>
            </Button>

            {level < 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="text-xs">Reply</span>
              </Button>
            )}

            {comment.replies > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReplies}
                className="h-8 gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="text-xs">
                  {showReplies ? "Hide" : "Show"} {comment.replies} {comment.replies === 1 ? "reply" : "replies"}
                </span>
              </Button>
            )}

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-xs">Delete</span>
              </Button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  setRepliesLoaded(false);
                  loadReplies();
                }}
                placeholder="Write a reply..."
              />
            </div>
          )}
        </div>
      </div>

      {showReplies && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              level={level + 1}
              onDelete={() => {
                setRepliesLoaded(false);
                loadReplies();
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
