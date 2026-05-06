import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { demoSessions } from "@/lib/training/data";
import { generateInsights, getTodayWorkout, getWeeklySummary, suggestProgression } from "@/lib/training/logic";

export default function HomePage() {
  const today = new Date("2026-05-05T12:00:00");
  const workout = getTodayWorkout(today);
  const insights = generateInsights(demoSessions, today);
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);
  const firstLift = workout.exercises[0];
  const weeklySummary = getWeeklySummary(demoSessions, today);

  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <main className="safe-bottom mx-auto min-h-screen w-full max-w-md bg-surface px-4 pb-28 pt-6 text-ink">
      {/* Top bar */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-[#2563eb] text-sm font-bold text-white">
            W
          </div>
          <div>
            <p className="text-xs text-label">Good morning</p>
            <p className="text-sm font-semibold text-ink">William</p>
          </div>
        </div>
        <p className="mono-copy text-xs text-label">{dateLabel}</p>
      </header>

      {/* Today's workout — primary blue card */}
      <section className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-label">Today's Workout</p>
        <div className="rounded-3xl bg-[#2563eb] p-5 text-white">
          <p className="text-sm font-medium text-white/75">{workout.focus}</p>
          <h1 className="chunky-title mt-1 text-4xl font-black leading-none">{workout.title}</h1>
          <div className="mt-4 flex items-baseline gap-5">
            <div>
              <span className="text-4xl font-black leading-none">{workout.exercises.length}</span>
              <span className="ml-1 text-sm font-medium text-white/70">blocks</span>
            </div>
            <div>
              <span className="text-4xl font-black leading-none">{totalSets}</span>
              <span className="ml-1 text-sm font-medium text-white/70">sets</span>
            </div>
          </div>
          <p className="mono-copy mt-3 text-xs leading-5 text-white/70">{suggestProgression(firstLift, demoSessions)}</p>
          <Link
            href="/workout"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#2563eb]"
          >
            Start workout
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Bento row — dark + soft blue */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <WeeklySetsCard summary={weeklySummary} plannedSets={totalSets} />
        <LoadCard changePercent={weeklySummary.volumeChangePercent} totalVolume={weeklySummary.totalVolume} />
      </section>

      {/* Coach feed */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-label">Coach Feed</p>
        <div className="space-y-3">
          {insights.slice(0, 2).map((insight) => (
            <article key={insight.id} className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
              <p className="text-sm font-bold text-ink">{insight.title}</p>
              <p className="mono-copy mt-1 text-xs leading-5 text-label">{insight.message}</p>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function WeeklySetsCard({ summary, plannedSets }: { summary: ReturnType<typeof getWeeklySummary>; plannedSets: number }) {
  const maxSets = Math.max(plannedSets, ...summary.dailySetCounts, 1);

  return (
    <article className="rounded-3xl bg-[#111111] p-4 text-white">
      <p className="mono-copy text-xs text-white/55">This week</p>
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {summary.dailySetCounts.map((sets, index) => (
          <div
            key={index}
            className={`flex-1 rounded-full ${sets > 0 ? "bg-white/80" : "bg-white/20"}`}
            style={{ height: `${Math.max(12, (sets / maxSets) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mono-copy mt-3 text-lg font-black leading-none">{summary.completedSets}</p>
      <p className="mono-copy text-xs text-white/55">of {plannedSets} sets</p>
    </article>
  );
}

function LoadCard({ changePercent, totalVolume }: { changePercent: number | null; totalVolume: number }) {
  const positive = (changePercent ?? 0) >= 0;

  return (
    <article className="rounded-3xl bg-[#e8eeff] p-4 text-[#111111]">
      <p className="mono-copy text-xs text-[#555]">Load trend</p>
      <svg className="mt-3 h-16 w-full" viewBox="0 0 160 105" aria-hidden>
        <path d="M5 76 L38 46 L60 46 L78 12 L98 12 L121 50 L139 50 L156 18" fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 34 L34 34 L61 22 L82 43 L99 58 L122 58 L145 50 L158 66" fill="none" stroke="#2563eb" strokeWidth="3" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mono-copy mt-2 text-lg font-black leading-none text-[#111]">
        {changePercent === null ? `${Math.round(totalVolume).toLocaleString()} lb` : `${positive ? "+" : ""}${changePercent}%`}
      </p>
      <p className="mono-copy text-xs text-[#555]">volume</p>
    </article>
  );
}
