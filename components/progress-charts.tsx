"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Muscle, MuscleVolume, WorkoutSession } from "@/lib/training/types";

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

function ChartPlaceholder({ height }: { height: string }) {
  return <div className={`${height} w-full rounded-2xl border border-line bg-white/5`} />;
}

export function LiftProgressChart({ sessions, exerciseId }: { sessions: WorkoutSession[]; exerciseId: string }) {
  const mounted = useMounted();
  const data = sessions
    .map((session) => {
      const sets = session.performedSets.filter((set) => set.exerciseId === exerciseId);
      return {
        date: session.date.slice(5),
        volume: sets.reduce((sum, set) => sum + set.weight * set.reps, 0)
      };
    })
    .filter((item) => item.volume > 0);

  return mounted ? (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
        <LineChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(248,243,231,0.09)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#9b98aa" fontSize={12} />
          <YAxis tickLine={false} axisLine={false} stroke="#9b98aa" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid rgba(248,243,231,0.12)",
              borderRadius: 16,
              color: "#f8f3e7"
            }}
          />
          <Line type="monotone" dataKey="volume" stroke="#f0c98d" strokeWidth={3} dot={{ r: 4, fill: "#8f6cff" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <ChartPlaceholder height="h-56" />
  );
}

export function MuscleVolumeChart({ volume, muscles }: { volume: MuscleVolume[]; muscles: Muscle[] }) {
  const mounted = useMounted();
  const data = volume
    .filter((item) => item.sets > 0)
    .map((item) => ({
      muscle: muscles.find((muscle) => muscle.id === item.muscleId)?.name ?? item.muscleId,
      sets: item.sets
    }));

  return mounted ? (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
        <BarChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(248,243,231,0.09)" strokeDasharray="3 3" />
          <XAxis dataKey="muscle" tickLine={false} axisLine={false} interval={0} fontSize={11} stroke="#9b98aa" />
          <YAxis tickLine={false} axisLine={false} stroke="#9b98aa" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid rgba(248,243,231,0.12)",
              borderRadius: 16,
              color: "#f8f3e7"
            }}
          />
          <Bar dataKey="sets" fill="#8f6cff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <ChartPlaceholder height="h-64" />
  );
}
