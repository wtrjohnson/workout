import { Zap } from "lucide-react";
import { isScheduledDay } from "@/lib/training/logic";
import type { WorkoutSession } from "@/lib/training/types";

type Props = {
  sessions: WorkoutSession[];
  schedule: string[];
  timeZone: string;
  today: Date;
};

function ymd(date: Date, timeZone: string): string {
  return date.toLocaleDateString("en-CA", { timeZone });
}

function startOfWeekSunday(date: Date, timeZone: string): Date {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short", timeZone });
  const order = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const idx = order.indexOf(weekday);
  const result = new Date(date);
  result.setDate(date.getDate() - idx);
  return result;
}

export function WeekCalendarStrip({ sessions, schedule, timeZone, today }: Props) {
  const completedYmds = new Set(
    sessions.filter((s) => s.status === "completed").map((s) => s.date)
  );
  const todayYmd = ymd(today, timeZone);
  const weekStart = startOfWeekSunday(today, timeZone);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayYmd = ymd(date, timeZone);
    const isToday = dayYmd === todayYmd;
    const isPast = dayYmd < todayYmd;
    const completed = completedYmds.has(dayYmd);
    const scheduled = isScheduledDay(date, schedule, timeZone);
    const missed = isPast && scheduled && !completed;
    const dayNum = Number(dayYmd.split("-")[2]);
    const weekdayLabel = date.toLocaleDateString("en-US", { weekday: "short", timeZone }).toUpperCase();
    return { dayYmd, isToday, isPast, completed, missed, scheduled, dayNum, weekdayLabel };
  });

  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone });

  return (
    <section className="mb-4 rounded-3xl border border-black/6 bg-white p-4 shadow-card">
      <p className="chunky-title text-xl font-black leading-none text-ink">{monthLabel}</p>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div key={d.dayYmd} className="flex flex-col items-center gap-1">
            <span className={`text-[10px] font-bold ${d.isToday ? "text-ink" : "text-label/70"}`}>
              {d.weekdayLabel}
            </span>
            <div
              className={`flex h-14 w-full flex-col items-center justify-center rounded-2xl text-sm font-bold ${
                d.completed
                  ? "border-2 border-[#22c55e] bg-white text-[#15803d]"
                  : d.isToday
                    ? "border-2 border-ink bg-white text-ink"
                    : d.missed
                      ? "bg-[#f3f4f6] text-label/50"
                      : "bg-[#f3f4f6] text-label/70"
              }`}
              aria-label={`${d.weekdayLabel} ${d.dayNum}${d.completed ? ", completed" : d.isToday ? ", today" : ""}`}
            >
              {d.completed ? (
                <>
                  <Zap className="size-5 fill-[#22c55e] text-[#22c55e]" aria-hidden />
                  <span className="mt-0.5 text-[10px] font-bold">{d.dayNum}</span>
                </>
              ) : (
                <span>{d.dayNum}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
