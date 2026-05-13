import { AppShell } from "@/components/app-shell";
import { DarkChartCard } from "@/components/dark-chart-card";
import { MetricRing } from "@/components/metric-ring";
import { LiftProgressChart, MuscleVolumeChart } from "@/components/progress-charts";
import { exercises, muscles } from "@/lib/training/data";
import { getSessionsWithSets } from "@/lib/db/queries";
import { calculateRecovery, calculateWeeklyMuscleVolume, getWeeklySummary } from "@/lib/training/logic";
import type { WorkoutSession } from "@/lib/training/types";

function primaryExerciseId(sessions: WorkoutSession[]): string {
  const vol = new Map<string, number>();
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    for (const set of s.performedSets) {
      vol.set(set.exerciseId, (vol.get(set.exerciseId) ?? 0) + set.weight * set.reps);
    }
  }
  let bestId = "goblet-squat";
  let bestVol = 0;
  for (const [id, v] of vol) {
    if (v > bestVol) { bestVol = v; bestId = id; }
  }
  return bestId;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  fresh: { bg: "bg-[#e8fdf0]", text: "text-[#16a34a]" },
  ready: { bg: "bg-[#e8eeff]", text: "text-[#2563eb]" },
  fatigued: { bg: "bg-[#fef3e2]", text: "text-[#d97706]" },
  recovering: { bg: "bg-[#fef3e2]", text: "text-[#d97706]" },
  overreached: { bg: "bg-[#fee2e2]", text: "text-[#dc2626]" }
};

export default async function ProgressPage() {
  const today = new Date();
  const sessions = await getSessionsWithSets();

  const volume = calculateWeeklyMuscleVolume(sessions, today);
  const recovery = calculateRecovery(sessions, today);
  const weekly = getWeeklySummary(sessions, today);

  const topExerciseId = primaryExerciseId(sessions);
  const topExerciseName = exercises.find((e) => e.id === topExerciseId)?.name ?? topExerciseId;

  const readiness = Math.round((recovery.filter((item) => item.status === "fresh" || item.status === "ready").length / recovery.length) * 100);
  const volumeTarget = Math.round((volume.filter((item) => item.status === "on_track" || item.status === "high").length / volume.length) * 100);
  const consistency = Math.min(100, Math.round((weekly.completedSessions / 3) * 100));

  return (
    <AppShell eyebrow="Analytics" title="Progress">
      <section className="grid grid-cols-3 gap-2">
        <MetricRing label="Load" value={volumeTarget} detail="volume" accent="violet" size="sm" />
        <MetricRing label="Ready" value={readiness} detail="recovery" accent="moss" size="sm" />
        <MetricRing label="Done" value={consistency} detail="sessions" accent="sand" size="sm" />
      </section>

      <DarkChartCard title={`${topExerciseName} volume`} subtitle="Total load by session">
        <LiftProgressChart sessions={sessions} exerciseId={topExerciseId} />
      </DarkChartCard>

      <DarkChartCard title="Weekly muscle volume" subtitle="Set distribution by target area">
        <MuscleVolumeChart volume={volume} muscles={muscles} />
      </DarkChartCard>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-label">Recovery Status</p>
        <div className="space-y-2">
          {recovery
            .filter((item) => item.lastTrainedDaysAgo !== null)
            .slice(0, 8)
            .map((item) => {
              const muscle = muscles.find((entry) => entry.id === item.muscleId);
              const colors = statusColors[item.status] ?? { bg: "bg-[#e8eeff]", text: "text-[#2563eb]" };
              return (
                <div key={item.muscleId} className="flex items-center justify-between rounded-2xl border border-black/6 bg-white px-4 py-3 shadow-card">
                  <span className="text-sm font-medium text-ink">{muscle?.name}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${colors.bg} ${colors.text}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
        </div>
      </section>
    </AppShell>
  );
}
