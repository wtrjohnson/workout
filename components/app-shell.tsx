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
    <main className="safe-bottom contour-bg mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden px-4 pb-24 pt-5 text-white">
      {(eyebrow || title || action) && (
        <header className="-mx-4 -mt-5 mb-5 flex items-start justify-between gap-4 rounded-b-[2.2rem] bg-[#454545] px-5 pb-6 pt-6">
          <div>
            {eyebrow ? <p className="mono-copy text-sm leading-none text-white/82">{eyebrow}</p> : null}
            {title ? <h1 className="chunky-title mt-2 text-4xl font-black leading-[0.9] text-white">{title}</h1> : null}
          </div>
          {action}
        </header>
      )}
      <div className="flex flex-1 flex-col gap-4">{children}</div>
      <BottomNav />
    </main>
  );
}
