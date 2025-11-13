"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import NewPostButton from "@/components/posts/new-post-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogOut, User, Settings, Shield, Search, Menu } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/constants";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    fetchUser();

    // user-updatedイベントを監視して、ユーザーデータを自動更新
    // revalidateTag()と組み合わせて、UIを即座に更新できるようにする
    const handleUserUpdated = () => {
      fetchUser();
    };

    window.addEventListener("user-updated", handleUserUpdated);

    // クリーンアップ：コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      window.removeEventListener("user-updated", handleUserUpdated);
    };
  }, []);

  // scroll listener ( performance optimization by throttle )
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // hide when scrolling down, show when scrolling up
          // hide when scrolling down more than 10px
          if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current) {
            // show when scrolling up
            setIsVisible(true);
          }

          // always show when at the top
          if (currentScrollY < 10) {
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        // set ticking to true to prevent multiple calls to the function
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUser = async () => {
    try {
      // cache: 'no-store'を使用して、revalidateTag()でクリアされたキャッシュを確実に取得
      // これにより、サーバー側のrevalidateTag()とクライアント側のfetchが正しく連携する
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // 401エラーの場合、ユーザーはログインしていない
        setUser(null);
      }
    } catch (error) {
      // User not logged in
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success(t("SUCCESS_SAVED"));
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(t("ERROR_GENERIC"));
    }
  };

  return (
    <motion.nav
      initial={{ y: "-100%" }}
      animate={{
        y: isVisible ? 0 : "-100%",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 md:px-4 bg-background shadow-sm"
    >
      <Button variant="ghost" asChild>
        <Link href="/search">
          <Search className="h-4 w-4" />
        </Link>
      </Button>
      <Link
        href="/"
        className="text-2xl font-bold hover:text-primary transition-colors"
      >
        {t("APP_NAME")}
      </Link>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" asChild>
            <Link href="/">
              <Menu className="h-4 w-4" />
            </Link>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            {/* TODO: Add logo here */}
            <SheetTitle>{t("APP_NAME")}</SheetTitle>
          </SheetHeader>
          {isLoading ? (
            // TODO: Set avatar loading style
            <div className="size-40 rounded-full bg-muted animate-pulse" />
          ) : // TODO: Set user avatar style
          user ? (
            <div className="bg-red-500 flex flex-col items-center h-full w-full">
              <Button variant="ghost" className="size-40 rounded-full" asChild>
                <Link href="/">
                  <Avatar className="size-40">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </Button>
              {/* TODO: Add other navigation items here. like mini mypage, new post button, log out button, etc. */}
              <div>
                <NewPostButton size="lg" />
                <Button variant="ghost" asChild>
                  <Link href="/settings">
                    <Settings className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            // TODO: Set not logged in style
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">{t("LOGIN")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">{t("REGISTER")}</Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.nav>
  );
}
