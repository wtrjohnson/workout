"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Moon, Zap } from "lucide-react";
import { useState } from "react";
import { isScheduledDay } from "@/lib/training/logic";
import type { WorkoutSession } from "@/lib/training/types";

type Props = {
  sessions: WorkoutSession[];
  schedule: string[];
  timeZone: string;
  today: Date;
};

type DayInfo = {
  dayYmd: string;
  isToday: boolean;
  isPast: boolean;
  completed: boolean;
  missed: boolean;
  scheduled: boolean;
  dayNum: number;
  weekdayLabel: string;
  inMonth: boolean;
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

function buildMonthGrid(
  viewDate: Date,
  timeZone: string,
  todayYmd: string,
  completedYmds: Set<string>,
  schedule: string[]
): DayInfo[] {
  const viewYmd = ymd(viewDate, timeZone);
  const monthPrefix = viewYmd.slice(0, 7);
  const [year, month] = monthPrefix.split("-").map(Number);

  const firstOfMonth = new Date(year, month - 1, 1, 12, 0, 0);
  const gridStart = startOfWeekSunday(firstOfMonth, timeZone);

  const lastOfMonth = new Date(year, month, 0, 12, 0, 0);
  const lastSunday = startOfWeekSunday(lastOfMonth, timeZone);
  const lastSat = new Date(lastSunday);
  lastSat.setDate(lastSunday.getDate() + 6);

  const totalDays = Math.round((lastSat.getTime() - gridStart.getTime()) / 86_400_000) + 1;

  return Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const dayYmd = ymd(date, timeZone);
    const inMonth = dayYmd.slice(0, 7) === monthPrefix;
    const isToday = dayYmd === todayYmd;
    const isPast = dayYmd < todayYmd;
    const completed = completedYmds.has(dayYmd);
    const scheduled = isScheduledDay(date, schedule, timeZone);
    const missed = inMonth && isPast && scheduled && !completed;
    const dayNum = Number(dayYmd.split("-")[2]);
    const weekdayLabel = date.toLocaleDateString("en-US", { weekday: "short", timeZone }).toUpperCase();
    return { dayYmd, isToday, isPast, completed, missed, scheduled, dayNum, weekdayLabel, inMonth };
  });
}

const DOW_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function WeekCalendarStrip({ sessions, schedule, timeZone, today }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [viewDate, setViewDate] = useState(today);

  const completedYmds = new Set(
    sessions.filter((s) => s.status === "completed").map((s) => s.date)
  );
  const todayYmd = ymd(today, timeZone);
  const weekStart = startOfWeekSunday(today, timeZone);

  const weekDays: DayInfo[] = Array.from({ length: 7 }, (_, i) => {
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
    return { dayYmd, isToday, isPast, completed, missed, scheduled, dayNum, weekdayLabel, inMonth: true };
  });

  const monthLabel = (expanded ? viewDate : today).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone,
  });

  function prevMonth() {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() - 1);
    setViewDate(d);
  }

  function nextMonth() {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    setViewDate(d);
  }

  const monthGrid = expanded
    ? buildMonthGrid(viewDate, timeZone, todayYmd, completedYmds, schedule)
    : [];

  return (
    <section className="mb-4 rounded-3xl border border-black/6 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="chunky-title text-xl font-black leading-none text-ink">{monthLabel}</p>
        <div className="flex items-center gap-0.5">
          {expanded && (
            <>
              <button
                type="button"
                onClick={prevMonth}
                className="flex items-center justify-center rounded-full p-1.5 text-label/70 hover:bg-black/5"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex items-center justify-center rounded-full p-1.5 text-label/70 hover:bg-black/5"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setExpanded(!expanded);
              if (expanded) setViewDate(today);
            }}
            className={`flex items-center justify-center rounded-full p-1.5 ${
              expanded ? "bg-ink/10 text-ink" : "text-label/70 hover:bg-black/5"
            }`}
            aria-label={expanded ? "Collapse to week view" : "Expand to month view"}
          >
            <CalendarDays className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-4">
          <div className="grid grid-cols-7 gap-1.5">
            {DOW_LABELS.map((label) => (
              <div key={label} className="flex justify-center">
                <span className="text-[10px] font-bold text-label/70">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {monthGrid.map((d) => (
              <CalendarCell key={d.dayYmd} d={d} cellHeight="h-10" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => (
            <div key={d.dayYmd} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-bold ${d.isToday ? "text-ink" : "text-label/70"}`}>
                {d.weekdayLabel}
              </span>
              <CalendarCell d={d} cellHeight="h-14" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CalendarCell({ d, cellHeight }: { d: DayInfo; cellHeight: string }) {
  const isLarge = cellHeight === "h-14";
  const isRest = !d.scheduled && !d.completed;

  if (!d.inMonth) {
    return (
      <div className={`flex ${cellHeight} w-full items-center justify-center rounded-2xl bg-[#f3f4f6] text-label/30`}>
        <span className="text-sm font-bold">{d.dayNum}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex ${cellHeight} w-full flex-col items-center justify-center rounded-2xl text-sm font-bold ${
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
          <Zap
            className={`${isLarge ? "size-5" : "size-4"} fill-[#22c55e] text-[#22c55e]`}
            aria-hidden
          />
          <span className="mt-0.5 text-[10px] font-bold">{d.dayNum}</span>
        </>
      ) : isRest ? (
        <>
          <Moon className="size-3 text-label/40" aria-hidden />
          <span className={isLarge ? "" : "text-xs"}>{d.dayNum}</span>
        </>
      ) : (
        <span>{d.dayNum}</span>
      )}
    </div>
  );
}
