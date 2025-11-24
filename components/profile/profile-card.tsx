import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPublic } from "@/lib/types";
import { AnonymousUser } from "@/lib/constants";

export default function ProfileCard({
  size = "sm",
  direction = "horizontal",
  user = AnonymousUser,
  className,
}: {
  size?: "sm" | "lg";
  direction?: "vertical" | "horizontal";
  user?: UserPublic;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="grid-cols-2 auto-rows-max auto-cols-max">
        <Avatar className="size-10 row-span-2">
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
        <CardTitle>
          {(user as any).nickname ||
            (user as any).profile?.nickname ||
            (user as any).userId ||
            "Unknown"}
        </CardTitle>
        <CardDescription>@{user.userId}</CardDescription>
      </CardHeader>
      <CardContent>
        {(user as any).name ||
          (user as any).profile?.name ||
          (user as any).userId ||
          "Unknown"}
      </CardContent>
    </Card>
  );
}
