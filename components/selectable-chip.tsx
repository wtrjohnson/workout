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
      className={`tap-target card-hover rounded-full border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-[#2563eb]/30 bg-[#2563eb] text-white"
          : "border-black/8 bg-surface text-ink hover:border-[#2563eb]/20 hover:bg-[#e8eeff]"
      } ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
