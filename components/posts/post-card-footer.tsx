import Link from "next/link";
import PostCardAuthor from "@/components/posts/post-card-author";
import { CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, Heart } from "lucide-react";
import { PostWithUser } from "@/lib/types";
import { User } from "@/lib/types";
import { t } from "@/lib/constants";

interface PostCardFooterProps {
  post: PostWithUser;
  handleLike: () => void;
  isLiking: boolean;
  likes: number;
  isLiked?: boolean;
}

export default function PostCardFooter({
  post,
  handleLike,
  isLiking,
  likes,
  isLiked = false,
}: PostCardFooterProps) {
  // 1時間以内の場合は分を表示し、24時間以内の場合は時間を表示し、3日以内の場合は日数を表示し、それ以外は日付と時間を表示する関数
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 3
      ? diffHours < 24
        ? diffMinutes < 60
          ? diffMinutes + " " + t("MINUTES_AGO")
          : diffHours + " " + t("HOURS_AGO")
        : diffDays + " " + t("DAYS_AGO")
      : date.toLocaleDateString();
  };
  const getStringCount = (count: number) => {
    return count >= 1000000
      ? (count / 1000000).toFixed(2) + "M"
      : count >= 1000
      ? (count / 1000).toFixed(1) + "K"
      : count.toString();
  };

  return (
    <CardFooter className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <PostCardAuthor user={post.user as User} />
        {post.createdAt && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-muted-foreground">
                {getTimeAgo(new Date(post.createdAt))}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {new Date(post.createdAt).toLocaleDateString() +
                " " +
                new Date(post.createdAt).toLocaleTimeString()}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/posts/${post.id}`} className="text-sm text-right">
                <Eye className="size-4" />
                <span>{getStringCount(post.views)}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("SEE_MORE")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className="gap-1"
            >
              <Heart
                className={`size-4 transition-all ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{getStringCount(likes)}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("LIKE")}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* TODO: click to show comment form, submit comment, and redirect to the comment page */}
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/posts/${post.id}`} className="text-sm text-right">
                <MessageCircle className="size-4" />
                <span>{getStringCount(post._count.comments)}</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("COMMENT")}</TooltipContent>
        </Tooltip>
      </div>
    </CardFooter>
  );
}
