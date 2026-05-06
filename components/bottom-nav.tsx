"use client";

import { BarChart3, BookOpen, Dumbbell, Home, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const items: Array<{ href: Route; label: string; icon: typeof Home }> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/goals", label: "Setup", icon: SlidersHorizontal }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.8rem+env(safe-area-inset-bottom))]">
      <div className="glass-panel mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.6rem] p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`tap-target flex flex-col items-center justify-center rounded-[1.1rem] text-xs font-semibold transition ${
                active ? "bg-sand text-night shadow-glow" : "text-fog/65 hover:bg-white/7 hover:text-ink"
              }`}
              aria-label={item.label}
            >
              <Icon className="mb-1 size-5" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
