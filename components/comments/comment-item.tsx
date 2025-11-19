"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PostCardAuthor from "@/components/posts/post-card-author";
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
import type { CommentWithUser, BettingLog } from "@/lib/types";
import { t } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface CommentItemProps {
  comment: CommentWithUser;
  postId: string;
  currentUserId?: string;
  onDelete?: () => void;
  level?: number;
  rootCommentId?: string;
  onReplyAdded?: () => void;
  bet?: BettingLog | null;
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
  onDelete,
  level = 0,
  rootCommentId,
  onReplyAdded,
  bet,
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
        throw new Error(result.error || t("FAILED_TO_LIKE_COMMENT"));
      }

      setLikes(result.likes);
      setIsLiked(result.isLiked);
      toast.success(result.isLiked ? t("COMMENT_LIKED") : t("COMMENT_UNLIKED"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("FAILED_TO_LIKE_COMMENT")
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("DELETE_COMMENT_CONFIRM"))) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("FAILED_TO_DELETE_COMMENT"));
      }

      toast.success(t("COMMENT_DELETED"));
      onDelete?.();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("FAILED_TO_DELETE_COMMENT")
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
          toast.error(t("FAILED_TO_LOAD_REPLIES"));
        });
    }
  };

  useEffect(() => {
    if (comment.replies > 0 && level === 0) {
      loadReplies();
    }
  }, [comment.id, comment.replies, level, reloadTrigger]);

  const isOwner = currentUserId === comment.user.id;
  const isDeleted = !!comment.deletedAt; // 削除されているかチェック / Check if deleted

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? "ml-8 border-l-2 pl-4" : ""}`}
    >
      <div className="flex gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <PostCardAuthor user={comment.user} />
            {bet && (
              <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800">
                <Trophy className="w-3 h-3" />
                Bet: {bet.target_winner_id} ({Number(bet.bet_amount)})
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(comment.createdAt).toLocaleDateString()}
            {new Date(comment.createdAt).toLocaleTimeString()}
          </span>

          {/* 削除されたコメントの場合はプレースホルダーを表示 / Show placeholder for deleted comments */}
          {isDeleted ? (
            <p className="text-sm text-muted-foreground italic">
              {t("COMMENT_DELETED_PLACEHOLDER")}
            </p>
          ) : (
            <p className="text-sm">{comment.content}</p>
          )}

          {/* 削除されたコメントの場合は操作ボタンを非表示 / Hide action buttons for deleted comments */}
          {!isDeleted && (
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
                  {isLiked ? t("UNLIKE") : t("LIKE")}
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
                <TooltipContent>{t("REPLY")}</TooltipContent>
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
                  <TooltipContent>{t("DELETE")}</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* 削除されていない場合のみ返信フォームを表示 / Show reply form only if not deleted */}
          {!isDeleted && showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={effectiveRootId}
                onSuccess={() => {
                  setShowReplyForm(false);
                  // サーバーコンポーネントに変換したため、router.refresh()でページ全体を更新
                  // Since we converted to server component, refresh the entire page with router.refresh()
                  router.refresh();
                }}
                placeholder={t("WRITE_REPLY")}
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
