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
  return <div className={`${height} w-full rounded-2xl border border-black/6 bg-surface`} />;
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
          <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#888" fontSize={12} />
          <YAxis tickLine={false} axisLine={false} stroke="#888" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              color: "#111111",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
            }}
          />
          <Line type="monotone" dataKey="volume" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} />
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
          <CartesianGrid stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="muscle" tickLine={false} axisLine={false} interval={0} fontSize={11} stroke="#888" />
          <YAxis tickLine={false} axisLine={false} stroke="#888" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              color: "#111111",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
            }}
          />
          <Bar dataKey="sets" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <ChartPlaceholder height="h-64" />
  );
}
