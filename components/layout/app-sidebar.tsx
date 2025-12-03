"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SheetMenuButton from "@/components/common/sheet-menu-button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { t, TRANSLATIONS, APP_CONSTANTS } from "@/lib/constants";

export default function AppSideBar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-2xl font-[200] font-roboto tracking-tighter text-primary hover:text-primary/80 transition-colors uppercase">
          {t("APP_NAME")}
        </h1>
      </SidebarHeader>
      <SidebarContent className="">
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
      </SidebarContent>

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
    </Sidebar>
  );
}
