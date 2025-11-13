import Link from "next/link";
import ProfileCardMini from "@/components/profile/profile-card-mini";
import { CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostWithUser } from "@/lib/types";

export default function PostCardHeader({ post }: { post: PostWithUser }) {
  return (
    <CardHeader>
      <div className="w-fit grid grid-cols-[auto_1fr] space-x-2 space-y-1">
        <Link href={`/user/${post.user.userId}`} className="row-span-2">
          <Avatar className="size-10">
            <AvatarImage src={post.user.avatar || undefined} />
            <AvatarFallback>
              {post.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/user/${post.user.userId}`}
              className="w-fit border-foreground hover:border-b-2 text-lg font-semibold transition-all"
            >
              {post.user.nickname || post.user.name}
            </Link>
          </TooltipTrigger>
          <TooltipContent className="p-0">
            <ProfileCardMini user={post.user} />
          </TooltipContent>
        </Tooltip>
      </div>
    </CardHeader>
  );
}
