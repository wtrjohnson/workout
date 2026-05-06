type MetricRingProps = {
  label: string;
  value: number;
  detail: string;
  accent?: "violet" | "sand" | "moss";
  size?: "sm" | "md";
};

const accentMap = {
  violet: "stroke-violet text-lavender",
  sand: "stroke-sand text-sand",
  moss: "stroke-moss text-moss"
};

export function MetricRing({ label, value, detail, accent = "violet", size = "md" }: MetricRingProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const ringSize = size === "sm" ? "size-24" : "size-28";
  const textSize = size === "sm" ? "text-xl" : "text-2xl";

  return (
    <div className="glass-panel card-hover rounded-[1.5rem] p-3 text-center">
      <div className={`relative mx-auto ${ringSize}`}>
        <svg className="size-full -rotate-90" viewBox="0 0 36 36" aria-hidden>
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(248,243,231,0.1)" strokeWidth="3" />
          <circle
            className={`animate-ring-fill ${accentMap[accent].split(" ")[0]}`}
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
          <p className={`${textSize} font-black text-white`}>{Math.round(normalized)}%</p>
        </div>
      </div>
      <p className={`mt-2 text-xs font-semibold ${accentMap[accent].split(" ")[1]}`}>{label}</p>
      <p className="mt-1 text-xs text-fog/70">{detail}</p>
    </div>
  );
}
