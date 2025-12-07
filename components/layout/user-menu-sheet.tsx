"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SheetMenuButton from "@/components/common/sheet-menu-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Shield, LogOut } from "lucide-react";
import { t, TRANSLATIONS, APP_CONSTANTS } from "@/lib/constants";
import { UserMenuSheetProps } from "@/lib/types";

export function UserMenuSheet({
  user,
  isLoading,
  onLogout,
}: UserMenuSheetProps) {
  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative size-8 rounded-full hover:text-foreground">
          {isLoading ? (
            <div className="size-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Avatar>
              <AvatarImage src={user.avatar as string | undefined} />
              <AvatarFallback>
                {(user.name || user.userId || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar>
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
          </div>
        ) : user ? (
          <>
            <SheetHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {(user.name || user.userId || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <SheetTitle className="text-lg">
                    {user.name || user.userId}
                  </SheetTitle>
                  {user.nickname && (
                    <p className="text-sm text-muted-foreground mt-1">
                      @{user.nickname}
                    </p>
                  )}
                  {user.isAdmin && (
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      {t("NAV_ADMIN")}
                    </Badge>
                  )}
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col mt-6">
              {APP_CONSTANTS.USER_MENU_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <SheetMenuButton icon={item.icon}>
                    {t(item.label as keyof typeof TRANSLATIONS.en)}
                  </SheetMenuButton>
                </Link>
              ))}

              <Separator />

              {/* 管理員連結 - 僅管理員可見 */}
              {/* Admin link - only visible to admins */}
              {user.isAdmin && (
                <>
                  <Link href="/admin">
                    <SheetMenuButton icon={Shield}>
                      {t("NAV_ADMIN")}
                    </SheetMenuButton>
                  </Link>
                  <Separator />
                </>
              )}

              {/* 預留擴展區塊 */}
              {/* Reserved expansion area for future features */}
              {/* 
              TODO: 未來可添加以下功能：
              - 通知中心連結
              - 訊息中心連結
              - 其他用戶功能
              */}
            </div>

            <SheetFooter className="mt-auto p-0">
              <SheetMenuButton icon={LogOut} onClick={handleLogout}>
                {t("LOGOUT")}
              </SheetMenuButton>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <SheetHeader>
              <SheetTitle>{t("APP_NAME")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 w-full">
              <Button variant="default" className="w-full" asChild>
                <Link href="/login">{t("LOGIN")}</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">{t("REGISTER")}</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
