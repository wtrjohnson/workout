import { Bell, Plus, Star } from "lucide-react";
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

  return (
    <main className="safe-bottom contour-bg mx-auto min-h-screen w-full max-w-md overflow-hidden bg-night pb-24 text-white">
      <section className="rounded-b-[2.2rem] bg-[#454545] px-5 pb-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono-copy text-lg leading-none text-white">May 5, 2026</p>
            <h1 className="chunky-title mt-1 text-5xl font-black leading-[0.88] text-white">Hello, William</h1>
          </div>
          <button className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#101010] text-white" aria-label="Notifications" type="button">
            <Bell className="size-6 fill-white" />
          </button>
        </div>
        <div className="mono-copy mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white">
          <span className="flex items-center gap-2">
            <Plus className="size-5 text-[#ba00ff]" strokeWidth={4} />
            Ready to train
          </span>
          <span className="flex items-center gap-2">
            <Star className="size-5 fill-[#1974ff] text-[#1974ff]" />
            Workout {weeklySummary.completedSessions + 1} this week
          </span>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <WeeklySetsCard summary={weeklySummary} plannedSets={totalSets} />
          <LoadCard changePercent={weeklySummary.volumeChangePercent} totalVolume={weeklySummary.totalVolume} />
        </div>
      </section>

      <section className="mt-6 bg-[#101010] px-5 py-6">
        <p className="chunky-title text-5xl font-black leading-none text-white">Today’s workout</p>
        <h2 className="chunky-title mt-4 text-4xl font-black italic leading-none text-white">Wednesday Focus</h2>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <p>
            <span className="text-5xl font-light leading-none text-[#ba00ff]">{workout.exercises.length}</span>
            <span className="ml-1 text-4xl font-light text-white">blocks</span>
          </p>
          <p>
            <span className="text-5xl font-light leading-none text-[#1974ff]">{totalSets}</span>
            <span className="ml-1 text-4xl font-light text-white">sets</span>
          </p>
        </div>
        <p className="mono-copy mt-4 text-sm leading-6 text-white/86">{suggestProgression(firstLift, demoSessions)}</p>
        <Link
          href="/workout"
          className="mt-5 inline-flex rounded-2xl bg-[#5a007a] px-4 py-3 text-2xl font-black italic leading-none text-white"
        >
          Start workout
        </Link>
      </section>

      <section className="bg-[#101010] px-5 pb-8 pt-2">
        <h2 className="chunky-title text-4xl font-black leading-none text-white">Coach feed</h2>
        <div className="mt-3 space-y-5">
          {insights.slice(0, 2).map((insight) => (
            <article key={insight.id} className="border-t border-white/10 pt-4">
              <p className="chunky-title text-2xl font-black leading-none text-white">{insight.title}</p>
              <p className="mono-copy mt-2 text-sm leading-6 text-white/68">{insight.message}</p>
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
    <article className="h-48 rounded-[2rem] bg-[#52006f] p-4 text-white">
      <p className="mono-copy text-sm">This week</p>
      <div className="mt-5 flex h-20 items-end gap-2">
        {summary.dailySetCounts.map((sets, index) => (
          <div
            key={index}
            className={`w-4 rounded-full ${sets > 0 ? "bg-[#b05ed8]" : "bg-[#8c4bb0]"}`}
            style={{ height: `${Math.max(12, (sets / maxSets) * 100)}%` }}
          />
        ))}
      </div>
      <p className="mono-copy mt-4 text-xl">{summary.completedSets}/{plannedSets} sets</p>
    </article>
  );
}

function LoadCard({ changePercent, totalVolume }: { changePercent: number | null; totalVolume: number }) {
  const positive = (changePercent ?? 0) >= 0;

  return (
    <article className="h-48 rounded-[2rem] bg-[#082866] p-4 text-white">
      <p className="mono-copy text-sm">Load trend</p>
      <svg className="mt-8 h-20 w-full" viewBox="0 0 160 105" aria-hidden>
        <path d="M5 76 L38 46 L60 46 L78 12 L98 12 L121 50 L139 50 L156 18" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 34 L34 34 L61 22 L82 43 L99 58 L122 58 L145 50 L158 66" fill="none" stroke="#2e75d9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="mono-copy mt-1 text-xl">
        {changePercent === null ? `${Math.round(totalVolume).toLocaleString()} lb` : `${positive ? "+" : ""}${changePercent}%`}
      </p>
    </article>
  );
}
