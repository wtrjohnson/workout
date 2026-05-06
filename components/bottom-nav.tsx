"use client";

import { BarChart3, Home, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const items: Array<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/goals", label: "Goals", icon: SlidersHorizontal }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-1 rounded-full bg-[#111111] px-2 py-2 shadow-soft">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target flex size-12 items-center justify-center rounded-full transition-all duration-200 ${
                active ? "bg-white text-[#111111]" : "text-white/55 hover:text-white/85"
              }`}
              aria-label={item.label}
            >
              <Icon className="size-5" aria-hidden />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
