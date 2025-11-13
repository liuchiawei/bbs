import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { AnonymousUser } from "@/lib/constants";

export default function ProfileCardMini({
  user = AnonymousUser,
}: {
  user?: User;
}) {
  return (
    <div className="w-full p-3 space-y-2">
      <Link href={`/user/${user.userId}`} className="grid grid-cols-[1fr_auto] gap-1">
        <Avatar className="size-10 row-span-2">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="text-sm font-semibold">{user.nickname || user.userId}</h3>
        <h5 className="text-xs text-muted-foreground">@{user.userId}</h5>
      </Link>
      <p className="text-sm text-muted-foreground">{user.name}</p>
    </div>
  );
}
