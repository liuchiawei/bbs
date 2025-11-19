import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// TODO: Post Category Tag with Link
export default function PostCardHeader() {
  return (
    <div className="flex gap-2 md:gap-3">
      <Avatar className="size-8">
        <AvatarImage src="" />
        <AvatarFallback>{"Boxing".charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );
}
