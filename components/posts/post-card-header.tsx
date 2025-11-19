import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Category } from "@/lib/types";

export default function PostCardHeader({
  category,
}: {
  category?: Category | null;
}) {
  return (
    <Link
      href={`/category/${category?.slug || "general"}`}
      className="flex gap-2 md:gap-3"
    >
      <Avatar className="size-8">
        {/* TODO: 補充Category圖片 */}
        <AvatarImage src={category?.slug || "general"} />
        <AvatarFallback>
          {category?.name?.charAt(0).toUpperCase() || "G"}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
