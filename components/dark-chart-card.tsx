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
    <section className="glass-panel rounded-[2rem] p-4">
      <div className="mb-2">
        <h2 className="chunky-title text-2xl font-black leading-none text-white">{title}</h2>
        {subtitle ? <p className="mono-copy mt-2 text-sm text-white/58">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
