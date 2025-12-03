import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SiderbarMenuButton({
  href,
  icon,
  children,
  className,
  onClick,
}: {
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={cn("group w-full justify-start py-8 gap-4 rounded-none hover:text-foreground", className)}
      onClick={onClick}
      asChild={!!href}
    >
      {href ? (
        <Link href={href}>
          {icon}
          {children}
        </Link>
      ) : (
        <>
        <div className="size-4 group-hover:translate-x-1 transition-transform">
          {icon}
        </div>
          {children}
        </>
      )}
    </Button>
  );
}
