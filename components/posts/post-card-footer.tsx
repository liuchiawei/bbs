import Link from "next/link";
import { CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, Heart } from "lucide-react";
import { PostWithUser } from "@/lib/types";
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
  return (
    <CardFooter className="grid grid-cols-[1fr_auto_auto_auto]">
      {post.createdAt && (
        <p className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()}{" "}
          {new Date(post.createdAt).toLocaleTimeString()}
        </p>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/posts/${post.id}`} className="text-sm text-right">
              <Eye className="size-4" />
              <span>{post.views}</span>
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
            <span>{likes}</span>
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
              <span>{post._count.comments}</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("COMMENT")}</TooltipContent>
      </Tooltip>
    </CardFooter>
  );
}
