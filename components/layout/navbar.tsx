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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
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
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" asChild>
            <Link href="/">
              <Menu className="h-4 w-4" />
            </Link>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
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
                <NewPostButton />
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
      <Link
        href="/"
        className="text-2xl font-bold hover:text-primary transition-colors"
      >
        {t("APP_NAME")}
      </Link>
      <Button variant="ghost" asChild>
        <Link href="/search">
          <Search className="h-4 w-4" />
        </Link>
      </Button>

      {/* TODO: Remove below section when the sheet is implemented */}
      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <>
            <NewPostButton />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("SETTINGS")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/user/${user.userId}`}>
                    <User className="mr-2 h-4 w-4" />
                    {t("PROFILE")}
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        {t("ADMIN_DASHBOARD")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("LOGOUT")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">{t("LOGIN")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("REGISTER")}</Link>
            </Button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
