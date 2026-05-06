import { Brain, ChartNoAxesCombined, Flame, RotateCcw } from "lucide-react";
import type { Insight } from "@/lib/training/types";

const iconMap = {
  progress: ChartNoAxesCombined,
  balance: Brain,
  recovery: RotateCcw,
  consistency: Flame
};

export function InsightCard({ insight }: { insight: Insight }) {
  const Icon = iconMap[insight.type];

  return (
    <article className="card-hover animate-rise-in border-b border-line py-4">
      <div className="flex gap-4">
        <Icon className="mt-1 size-5 shrink-0 text-sand" aria-hidden />
        <div>
          <p className="text-2xl font-semibold leading-none text-ink">{insight.title}</p>
          <p className="mt-2 text-sm leading-6 text-fog/68">{insight.message}</p>
        </div>
      </div>
    </article>
  );
}
