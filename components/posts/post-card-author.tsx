import Link from "next/link";
import ProfileCardMini from "@/components/profile/profile-card-mini";
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
      <HoverCardTrigger className="flex items-center gap-2">
        <Link href={`/user/${user.userId}`}>
          <Avatar className="size-6">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <Link
          href={`/user/${user.userId}`}
          className="border-foreground hover:border-b-2 text-sm font-semibold transition-all"
        >
          {user.nickname || user.name}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <ProfileCardMini user={user} />
      </HoverCardContent>
    </HoverCard>
  );
}
