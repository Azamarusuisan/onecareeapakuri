"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/practice", label: "さがす", icon: Search },
  { href: "/sessions", label: "予定", icon: CalendarDays },
  { href: "/profile", label: "マイページ", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5]">
      <div className="mx-auto flex max-w-lg items-center justify-around" style={{ height: "52px", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-[2px] h-full text-[10px]",
                isActive
                  ? "text-[#059669] font-bold"
                  : "text-[#999] font-medium"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
