import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { AnonymousUser } from "@/lib/constants";

export default function ProfileCard({
  size = "sm",
  direction = "horizontal",
  user = AnonymousUser,
  className,
}: {
  size?: "sm" | "lg";
  direction?: "vertical" | "horizontal";
  user?: User;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="grid-cols-2 auto-rows-max auto-cols-max">
        <Avatar className="size-10 row-span-2">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.nickname || user.userId}</CardTitle>
        <CardDescription>@{user.userId}</CardDescription>
      </CardHeader>
      <CardContent>{user.name}</CardContent>
    </Card>
  );
}
