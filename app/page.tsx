import { ArrowRight, Flame } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { WeeklySetsChart, LoadTrendChart } from "@/components/home-charts";
import { demoSessions } from "@/lib/training/data";
import { generateInsights, getTodayWorkout, getWeeklySummary, suggestProgression } from "@/lib/training/logic";

function getStreak(sessions: typeof demoSessions): number {
  const completed = sessions
    .filter((s) => s.status === "completed")
    .map((s) => s.date)
    .sort()
    .reverse();
  return completed.length;
}

export default function HomePage() {
  const today = new Date("2026-05-05T12:00:00");
  const workout = getTodayWorkout(today);
  const insights = generateInsights(demoSessions, today);
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);
  const firstLift = workout.exercises[0];
  const weeklySummary = getWeeklySummary(demoSessions, today);
  const streak = getStreak(demoSessions);

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
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[#fff3e0] px-3 py-1 text-xs font-bold text-[#e65100]">
              <Flame className="size-3" aria-hidden />
              {streak} sessions
            </span>
          )}
          <p className="mono-copy text-xs text-label">{dateLabel}</p>
        </div>
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

      {/* Bento row — real charts */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <WeeklySetsChart
          dailySetCounts={weeklySummary.dailySetCounts}
          completedSets={weeklySummary.completedSets}
          plannedSets={totalSets}
        />
        <LoadTrendChart sessions={demoSessions} />
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
