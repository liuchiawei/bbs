import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { t } from "@/lib/constants";

export default function NewPostButton() {
  return (
    <Button asChild>
      <Link href="/posts/new">
        <PlusCircle className="mr-2 size-4" />
        {t("NEW_POST")}
      </Link>
    </Button>
  );
}