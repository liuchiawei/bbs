import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserPublic } from "@/lib/types";
import { AnonymousUser } from "@/lib/constants";

export default function PostProfileHoverCard({
  user = AnonymousUser,
}: {
  user?: UserPublic;
}) {
  return (
    <div className="w-full space-y-4 **:data-muted:text-muted-foreground **:data-muted:text-sm">
      <Link
        href={`/user/${user.userId}`}
        className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0"
      >
        <Avatar className="size-12 md:size-16 row-span-2">
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
        <div className="flex justify-between items-start">
          <h3 className="text-lg md:text-2xl font-semibold">
            {(user as any).nickname ||
              (user as any).profile?.nickname ||
              (user as any).userId ||
              "Unknown"}
          </h3>
          <h5 className="text-sm text-muted-foreground">
            @{user.userId}
          </h5>
        </div>
        <Label data-muted className="justify-between">
          {/* TODO: 增加追蹤人數 followers */}
          {/* TODO: 按下追蹤按鈕時即時更新追蹤人數 */}
          <span>100 Followers</span>
          {/* TODO: 從API獲取統計資料 */}
        </Label>
      </Link>
      <div className="grid grid-rows-[auto_1fr_auto] gap-2">
        <Label data-muted>
          {/* TODO: 增加基本資料，如拳齡、賽事成績等 */}
          <span>拳齡：10 年</span>
          <span>戰績：4-1-1 (4 KOs)</span>
        </Label>
        <div className="text-lg text-foreground line-clamp-2">
          {/* TODO: 增加使用者介紹 */}
          {/* TODO: 最大字數限制 ?? 字，超過時顯示 ... */}
          {/* TODO: 最大字數限制用 constant.ts 管理 */}
          どうぞよろしくお願いいたします。よろしくお願いします！
        </div>
      </div>
      {/* TODO: 增加 follow | unfollow 按鈕 */}
      <Button size="lg" className="w-full">
        Follow
      </Button>
    </div>
  );
}




