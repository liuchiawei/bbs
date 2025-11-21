"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { LogOut, User, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/constants";

interface UserMenuSheetProps {
  user: any | null;
  isLoading: boolean;
  onLogout: () => Promise<void>;
}

export function UserMenuSheet({ user, isLoading, onLogout }: UserMenuSheetProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>
                {(user.name || user.userId || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
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
            
            <div className="flex flex-col gap-2 mt-6">
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href={`/user/${user.userId}`}>
                  <User className="h-4 w-4" />
                  {t("NAV_MY_PAGE")}
                </Link>
              </Button>
              
              <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  {t("NAV_SETTINGS")}
                </Link>
              </Button>
              
              <Separator className="my-2" />
              
              {/* 管理員連結 - 僅管理員可見 */}
              {/* Admin link - only visible to admins */}
              {user.isAdmin && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 text-primary" 
                    asChild
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      {t("NAV_ADMIN")}
                    </Link>
                  </Button>
                  <Separator className="my-2" />
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
            
            <SheetFooter className="mt-auto">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {t("NAV_LOGOUT")}
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
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

