"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SheetMenuButton from "@/components/common/sheet-menu-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PanelLeft } from "lucide-react";
import { t, TRANSLATIONS, APP_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppSideBar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <PanelLeft className="size-4" />
          <span className="sr-only">{t("NAV_MENU")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{t("APP_NAME")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col">
          {APP_CONSTANTS.NAVIGATION_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "bg-secondary" : ""}
              >
                <SheetMenuButton icon={item.icon}>
                  {t(item.label as keyof typeof TRANSLATIONS.en)}
                </SheetMenuButton>
              </Link>
            );
          })}
        </div>

        <Separator />

        {/* 預留擴展區塊 */}
        {/* Reserved expansion area for future features */}
        {/* 
        TODO: 未來可添加以下功能：
        - 動態分類列表（從 API 獲取）
        - 收藏/書籤功能
        - 通知中心
        - 最近瀏覽的頁面
        */}
      </SheetContent>
    </Sheet>
  );
}
