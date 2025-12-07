import Link from "next/link";
import PostProfileHoverCard from "@/features/post/components/post-profile-hovercard";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPublic } from "@/lib/types";

export default function PostCardAuthor({ user }: { user: UserPublic }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={`/user/${user.userId}`} className="flex items-center gap-2 w-fit">
          <Avatar className="size-6">
            <AvatarImage
              src={
                (user as any).avatar ||
                (user as any).profile?.avatar ||
                undefined
              }
            />
            <AvatarFallback>
              {((user as any).name ||
                (user as any).profile?.name ||
                (user as any).userId ||
                "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="border-foreground hover:border-b-2 text-sm font-semibold transition-all">
            {(user as any).nickname ||
              (user as any).profile?.nickname ||
              (user as any).name ||
              (user as any).profile?.name ||
              (user as any).userId ||
              "Unknown"}
          </span>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <PostProfileHoverCard user={user} />
      </HoverCardContent>
    </HoverCard>
  );
}




