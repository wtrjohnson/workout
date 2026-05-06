import type { ReactNode } from "react";

export function DarkChartCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
      <div className="mb-2">
        <h2 className="chunky-title text-xl font-black leading-none text-ink">{title}</h2>
        {subtitle ? <p className="mono-copy mt-1 text-xs text-label">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
