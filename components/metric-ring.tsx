type MetricRingProps = {
  label: string;
  value: number;
  detail: string;
  accent?: "violet" | "sand" | "moss";
  size?: "sm" | "md";
};

const accentMap = {
  violet: { stroke: "stroke-[#7c3aed]", text: "text-[#7c3aed]", bg: "bg-[#f3eeff]" },
  sand: { stroke: "stroke-[#d97706]", text: "text-[#d97706]", bg: "bg-[#fef3e2]" },
  moss: { stroke: "stroke-[#16a34a]", text: "text-[#16a34a]", bg: "bg-[#e8fdf0]" }
};

export function MetricRing({ label, value, detail, accent = "violet", size = "md" }: MetricRingProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const ringSize = size === "sm" ? "size-24" : "size-28";
  const textSize = size === "sm" ? "text-xl" : "text-2xl";
  const colors = accentMap[accent];

  return (
    <div className="card-hover rounded-2xl border border-black/6 bg-white p-3 text-center shadow-card">
      <div className={`relative mx-auto ${ringSize}`}>
        <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
          <circle
            className={`animate-ring-fill ${colors.stroke}`}
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset={100 - normalized}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className={`${textSize} font-black text-ink`}>{Math.round(normalized)}%</p>
        </div>
      </div>
      <p className={`mt-2 text-xs font-bold ${colors.text}`}>{label}</p>
      <p className="mt-0.5 text-xs text-label">{detail}</p>
    </div>
  );
}
