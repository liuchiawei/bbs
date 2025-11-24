"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PanelLeft, Home, Calendar, Users, FolderTree, Search } from "lucide-react";
import { t, TRANSLATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// 導航項目配置
// Navigation items configuration
const navigationItems = [
  {
    href: "/",
    label: "NAV_HOME",
    icon: Home,
  },
  {
    href: "/event",
    label: "NAV_EVENTS",
    icon: Calendar,
  },
  {
    href: "/fighter",
    label: "NAV_FIGHTERS",
    icon: Users,
  },
  {
    href: "/category",
    label: "NAV_CATEGORIES",
    icon: FolderTree,
  },
  {
    href: "/search",
    label: "NAV_SEARCH",
    icon: Search,
  },
];

export function AppSideBar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">{t("NAV_MENU")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:w-80">
        <SheetHeader>
          <SheetTitle>{t("APP_NAME")}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.label as keyof typeof TRANSLATIONS.en)}
                </Button>
              </Link>
            );
          })}
        </div>
        
        <Separator className="my-4" />
        
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

