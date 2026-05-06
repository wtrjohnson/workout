"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { WorkoutSession } from "@/lib/training/types";

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}

export function WeeklySetsChart({
  dailySetCounts,
  completedSets,
  plannedSets
}: {
  dailySetCounts: number[];
  completedSets: number;
  plannedSets: number;
}) {
  const mounted = useMounted();
  const data = dailySetCounts.map((sets, i) => ({ day: DAY_LABELS[i], sets }));

  return (
    <article className="rounded-3xl bg-[#111111] p-4 text-white">
      <p className="mono-copy text-xs text-white/50">This week</p>
      {mounted ? (
        <div className="mt-2 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "none", borderRadius: 10, color: "#fff", fontSize: 12 }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="sets" fill="rgba(255,255,255,0.75)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-2 h-20 w-full rounded-xl bg-white/10" />
      )}
      <p className="mono-copy mt-1 text-lg font-black leading-none">{completedSets}</p>
      <p className="mono-copy text-xs text-white/50">of {plannedSets} sets</p>
    </article>
  );
}

export function LoadTrendChart({ sessions }: { sessions: WorkoutSession[] }) {
  const mounted = useMounted();
  const data = sessions
    .filter((s) => s.status === "completed")
    .map((s) => ({
      date: s.date.slice(5),
      volume: Math.round(s.performedSets.reduce((sum, set) => sum + set.weight * set.reps, 0))
    }));

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const changePercent = latest && prev && prev.volume > 0
    ? Math.round(((latest.volume - prev.volume) / prev.volume) * 100)
    : null;

  return (
    <article className="rounded-3xl bg-[#e8eeff] p-4 text-[#111]">
      <p className="mono-copy text-xs text-[#555]">Load trend</p>
      {mounted ? (
        <div className="mt-2 h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#888", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, color: "#111", fontSize: 12 }}
                cursor={{ stroke: "rgba(37,99,235,0.2)" }}
              />
              <Line type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-2 h-20 w-full rounded-xl bg-[#2563eb]/10" />
      )}
      <p className="mono-copy mt-1 text-lg font-black leading-none text-[#111]">
        {changePercent !== null ? `${changePercent >= 0 ? "+" : ""}${changePercent}%` : `${latest?.volume.toLocaleString() ?? "—"} lb`}
      </p>
      <p className="mono-copy text-xs text-[#555]">vs last session</p>
    </article>
  );
}
