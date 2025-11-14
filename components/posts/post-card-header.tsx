import Link from "next/link";
import ProfileCardMini from "@/components/profile/profile-card-mini";
import { CardHeader } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

export default function PostCardHeader({ user }: { user: User }) {
  return (
    <CardHeader>
      <div className="w-fit grid grid-cols-[auto_1fr] space-x-2 space-y-1">
        <Link href={`/user/${user.userId}`} className="row-span-2">
          <Avatar className="size-10">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link
              href={`/user/${user.userId}`}
              className="w-fit border-foreground hover:border-b-2 text-lg font-semibold transition-all"
            >
              {user.nickname || user.name}
            </Link>
          </HoverCardTrigger>
          <HoverCardContent>
            <ProfileCardMini user={user} />
          </HoverCardContent>
        </HoverCard>
      </div>
    </CardHeader>
  );
}
