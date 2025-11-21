"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { AppSideBar } from "@/components/layout/app-sidebar";
import { UserMenuSheet } from "@/components/layout/user-menu-sheet";
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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-2 md:px-4 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
    >
      {/* 左側：AppSideBar */}
      {/* Left side: AppSideBar */}
      <AppSideBar />
      
      {/* 中間：應用程式名稱 */}
      {/* Center: Application name */}
      <Link
        href="/"
        className="text-2xl font-black tracking-tighter text-primary hover:text-primary/80 transition-colors uppercase italic"
      >
        {t("APP_NAME")}
      </Link>
      
      {/* 右側：用戶選單 */}
      {/* Right side: User menu */}
      <UserMenuSheet 
        user={user} 
        isLoading={isLoading} 
        onLogout={handleLogout}
      />
    </motion.nav>
  );
}
