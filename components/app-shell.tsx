import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function AppShell({
  eyebrow,
  title,
  children,
  action
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="safe-bottom mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-surface px-4 pb-28 pt-6 text-ink">
      {(eyebrow || title || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? <p className="mono-copy text-xs font-semibold uppercase tracking-widest text-label">{eyebrow}</p> : null}
            {title ? <h1 className="chunky-title mt-1 text-4xl font-black leading-[0.9] text-ink">{title}</h1> : null}
          </div>
          {action}
        </header>
      )}
      <div className="flex flex-1 flex-col gap-4">{children}</div>
      <BottomNav />
    </main>
  );
}
