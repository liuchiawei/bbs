"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggleButton from "@/components/common/theme-toggle-button";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenuSheet } from "@/components/layout/user-menu-sheet";
import { t } from "@/lib/constants";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <nav className="flex items-center justify-between p-2 bg-background border-b border-border shadow-sm">
      {/* 左側：AppSideBar */}
      {/* Left side: AppSideBar */}
      <SidebarTrigger />

      {/* 中間：應用程式名稱 */}
      {/* Center: Application name */}
      <Link
        href="/"
        className="text-2xl font-[200] font-roboto tracking-tighter text-primary hover:text-primary/80 transition-colors uppercase"
      >
        {t("APP_NAME")}
      </Link>

      {/* 右側：用戶選單 */}
      {/* Right side: User menu */}
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <UserMenuSheet
          user={user}
          isLoading={isLoading}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
}
