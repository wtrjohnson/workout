import pkg from "../package.json";
import { Flame } from "lucide-react";
import { cookies, headers } from "next/headers";
import { BottomNav } from "@/components/bottom-nav";
import { CoachFeed } from "@/components/coach-feed";
import { StatsBar } from "@/components/stats-bar";
import { WeekCalendarStrip } from "@/components/week-calendar-strip";
import {
  getProfile,
  getProgram,
  getRecentCoachReplies,
  getSessionsWithSets,
  getTemplates,
} from "@/lib/db/queries";
import {
  generateCoachFeed,
  getMonthlySessionCount,
  getNextScheduledDay,
  getNextTemplate,
  getStreakDays,
  getWeeklySummary,
  isScheduledDay,
} from "@/lib/training/logic";

export default async function HomePage() {
  const today = new Date();

  const [sessions, templates, program, profile, replies, cookieStore, headersList] = await Promise.all([
    getSessionsWithSets(),
    getTemplates(),
    getProgram(),
    getProfile(),
    getRecentCoachReplies(20),
    cookies(),
    headers(),
  ]);

  const timeZone = headersList.get("x-vercel-ip-timezone") ?? "America/New_York";
  const todayStr = today.toLocaleDateString("en-CA", { timeZone });

  const schedule = program?.schedule ?? [];
  const isWorkoutDay = isScheduledDay(today, schedule, timeZone);
  const isSkipped = cookieStore.get("workout_skipped")?.value === todayStr;
  const pushedToRaw = cookieStore.get("workout_pushed_to")?.value ?? null;
  const isPushedToToday = pushedToRaw === todayStr;
  const workout = templates.length > 0 ? getNextTemplate(sessions, templates) : null;
  const nextDay = getNextScheduledDay(today, schedule, timeZone);

  const bubbles = generateCoachFeed({
    sessions,
    today,
    timeZone,
    schedule,
    workout,
    isWorkoutDay,
    isPushedToToday,
    isSkipped,
    nextDay,
  });

  const weeklySummary = getWeeklySummary(sessions, today);
  const streakDays = getStreakDays(sessions, schedule, timeZone, today);
  const monthlySessions = getMonthlySessionCount(sessions, today, timeZone);
  const weeklyGoal = profile?.trainingDaysPerWeek ?? schedule.length ?? 3;
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  });

  return (
    <main className="safe-bottom mx-auto min-h-screen w-full max-w-md bg-surface px-4 pb-28 pt-6 text-ink">
      <header className="mb-5 flex items-center justify-between">
        <p className="mono-copy text-sm text-label">{dateLabel}</p>
        {streakDays > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-[#fff3e0] px-2.5 py-1 text-xs font-bold text-[#e65100]">
            <Flame className="size-3" aria-hidden />
            {streakDays}
          </span>
        )}
      </header>

      <CoachFeed bubbles={bubbles} replies={replies} />

      <WeekCalendarStrip sessions={sessions} schedule={schedule} timeZone={timeZone} today={today} />

      <StatsBar
        streakDays={streakDays}
        monthlySessions={monthlySessions}
        weeklyCompleted={weeklySummary.completedSessions}
        weeklyGoal={weeklyGoal}
      />

      <p className="mono-copy mt-6 text-center text-xs text-label/50">v{pkg.version}</p>

      <BottomNav />
    </main>
  );
}
