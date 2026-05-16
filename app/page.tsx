import pkg from "../package.json";
import { ArrowRight, Flame } from "lucide-react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { SkipWorkoutButton } from "@/components/skip-workout-button";
import { WeeklySetsChart, LoadTrendChart } from "@/components/home-charts";
import { LiftProgressChart } from "@/components/progress-charts";
import { exercises } from "@/lib/training/data";
import { getSessionsWithSets, getTemplates, getProgram } from "@/lib/db/queries";
import {
  generateInsights,
  getNextTemplate,
  getNextScheduledDay,
  getWeeklySummary,
  isScheduledDay,
  suggestProgression,
} from "@/lib/training/logic";
import type { WorkoutSession } from "@/lib/training/types";

function getStreak(sessions: WorkoutSession[]): number {
  return sessions.filter((s) => s.status === "completed").length;
}

export default async function HomePage() {
  const today = new Date();

  const [sessions, templates, program, cookieStore, headersList] = await Promise.all([
    getSessionsWithSets(),
    getTemplates(),
    getProgram(),
    cookies(),
    headers(),
  ]);

  const timeZone = headersList.get("x-vercel-ip-timezone") ?? "America/New_York";
  const todayStr = today.toLocaleDateString("en-CA", { timeZone }); // YYYY-MM-DD in user's tz

  const schedule = program?.schedule ?? [];
  const isWorkoutDay = isScheduledDay(today, schedule, timeZone);
  const isSkipped = cookieStore.get("workout_skipped")?.value === todayStr;
  const pushedToRaw = cookieStore.get("workout_pushed_to")?.value ?? null;
  const isPushedToToday = pushedToRaw === todayStr;
  const pushedToLabel = pushedToRaw
    ? new Date(pushedToRaw + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : null;
  const workout = templates.length > 0 ? getNextTemplate(sessions, templates) : null;
  const nextDay = getNextScheduledDay(today, schedule, timeZone);

  const insights = generateInsights(sessions, today);
  const weeklySummary = getWeeklySummary(sessions, today);
  const streak = getStreak(sessions);
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone });

  const showWorkout = (isWorkoutDay || isPushedToToday) && !isSkipped;

  return (
    <main className="safe-bottom mx-auto min-h-screen w-full max-w-md bg-surface px-4 pb-28 pt-6 text-ink">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <p className="mono-copy text-sm text-label">{dateLabel}</p>
        {streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#fff3e0] px-2.5 py-1 text-xs font-bold text-[#e65100]">
            <Flame className="size-3" aria-hidden />
            {streak}
          </span>
        )}
      </header>

      {/* Today's workout or rest day */}
      <section className="mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-label">Today</p>

        {showWorkout && workout ? (
          <div className="rounded-3xl bg-[#2563eb] p-5 text-white">
            <p className="text-sm font-medium text-white/75">{workout.focus}</p>
            <h1 className="chunky-title mt-1 text-4xl font-black leading-none">{workout.title}</h1>
            <div className="mt-4 flex items-baseline gap-5">
              <div>
                <span className="text-4xl font-black leading-none">{workout.exercises.length}</span>
                <span className="ml-1 text-sm font-medium text-white/70">blocks</span>
              </div>
              <div>
                <span className="text-4xl font-black leading-none">
                  {workout.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)}
                </span>
                <span className="ml-1 text-sm font-medium text-white/70">sets</span>
              </div>
            </div>
            <p className="mono-copy mt-3 text-xs leading-5 text-white/70">
              {suggestProgression(workout.exercises[0], sessions)}
            </p>
            <Link
              href="/workout"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#2563eb]"
            >
              Start workout
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <div className="mt-1 flex">
              <SkipWorkoutButton today={todayStr} pushedToLabel={pushedToLabel} />
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-card">
            <p className="text-sm font-medium text-label">
              {isSkipped ? `Moved to ${pushedToLabel ?? "tomorrow"}` : "Rest Day"}
            </p>
            <h1 className="chunky-title mt-1 text-4xl font-black leading-none text-ink">
              {isSkipped ? (workout?.title ?? "Recovery") : "Recovery"}
            </h1>
            <p className="mono-copy mt-3 text-xs leading-5 text-label">
              {isSkipped
                ? `This session is queued for ${pushedToLabel ?? "tomorrow"}. It will still be here.`
                : `Recovery is part of the program. Next session: ${nextDay}.`}
            </p>
            {workout && (
              <p className="mono-copy mt-1 text-xs text-label">
                Up next: {workout.title}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Main lift progression chart */}
      {workout && (
        <section className="mb-4">
          <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-label">Main Lift</p>
            <h2 className="chunky-title mt-1 text-2xl font-black leading-none text-ink">
              {exercises.find((e) => e.id === workout.exercises[0].exerciseId)?.name ?? workout.exercises[0].exerciseId}
            </h2>
            <p className="mono-copy mt-0.5 text-xs text-label">Volume over recent sessions</p>
            <div className="mt-3">
              <LiftProgressChart sessions={sessions} exerciseId={workout.exercises[0].exerciseId} />
            </div>
          </div>
        </section>
      )}

      {/* Bento row — weekly stats */}
      <section className="mb-6 grid grid-cols-2 gap-3">
        <WeeklySetsChart
          dailySetCounts={weeklySummary.dailySetCounts}
          completedSets={weeklySummary.completedSets}
          plannedSets={workout?.exercises.reduce((sum, ex) => sum + ex.targetSets, 0) ?? 0}
        />
        <LoadTrendChart sessions={sessions} />
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

      <p className="mono-copy mt-6 text-center text-xs text-label/50">v{pkg.version}</p>

      <BottomNav />
    </main>
  );
}
