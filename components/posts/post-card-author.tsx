import Link from "next/link";
import PostProfileHoverCard from "@/components/posts/post-profile-hovercard";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

export default function PostCardAuthor({ user }: { user: User }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={`/user/${user.userId}`} className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="border-foreground hover:border-b-2 text-sm font-semibold transition-all">
            {user.nickname || user.name}
          </span>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <PostProfileHoverCard user={user} />
      </HoverCardContent>
    </HoverCard>
  );
}
