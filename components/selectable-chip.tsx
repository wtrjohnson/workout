import type { ReactNode } from "react";

export function SelectableChip({
  children,
  active = false,
  onClick,
  className = ""
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={`tap-target card-hover rounded-full border px-3 py-2 text-xs font-semibold ${
        active
          ? "border-sand/70 bg-sand text-night shadow-glow"
          : "border-line bg-white/5 text-fog hover:border-sand/40 hover:text-ink"
      } ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
