import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { t } from "@/lib/constants";

export default function NewPostButton({size = "default"}: {size?: "sm" | "default" | "lg" | "icon" | "icon-sm" | "icon-lg"}) {
  return (
    <Button size={size} asChild>
      <Link href="/posts/new">
        <Plus className="mr-2 size-4" />
        {t("NEW_POST")}
      </Link>
    </Button>
  );
}