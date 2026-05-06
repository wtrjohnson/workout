import { AppShell } from "@/components/app-shell";
import { DarkChartCard } from "@/components/dark-chart-card";
import { MetricRing } from "@/components/metric-ring";
import { LiftProgressChart, MuscleVolumeChart } from "@/components/progress-charts";
import { demoSessions, muscles } from "@/lib/training/data";
import { calculateRecovery, calculateWeeklyMuscleVolume } from "@/lib/training/logic";

export default function ProgressPage() {
  const today = new Date("2026-05-05T12:00:00");
  const volume = calculateWeeklyMuscleVolume(demoSessions, today);
  const recovery = calculateRecovery(demoSessions, today);
  const readiness = Math.round((recovery.filter((item) => item.status === "fresh" || item.status === "ready").length / recovery.length) * 100);
  const volumeTarget = Math.round((volume.filter((item) => item.status === "on_track" || item.status === "high").length / volume.length) * 100);
  const consistency = Math.min(100, Math.round((demoSessions.filter((session) => session.status === "completed").length / 3) * 100));

  return (
    <AppShell eyebrow="Analytics" title="Progress dashboard">
      <section className="grid grid-cols-3 gap-2">
        <MetricRing label="Load" value={volumeTarget} detail="volume" accent="violet" size="sm" />
        <MetricRing label="Ready" value={readiness} detail="recovery" accent="moss" size="sm" />
        <MetricRing label="Done" value={consistency} detail="sessions" accent="sand" size="sm" />
      </section>

      <DarkChartCard title="Lat pulldown volume" subtitle="Total load by session">
        <LiftProgressChart sessions={demoSessions} exerciseId="lat-pulldown" />
      </DarkChartCard>

      <DarkChartCard title="Weekly muscle volume" subtitle="Set distribution by target area">
        <MuscleVolumeChart volume={volume} muscles={muscles} />
      </DarkChartCard>

      <section className="glass-panel rounded-[1.5rem] p-4">
        <h2 className="text-base font-semibold text-ink">Recovery status</h2>
        <div className="mt-3 space-y-2">
          {recovery
            .filter((item) => item.lastTrainedDaysAgo !== null)
            .slice(0, 8)
            .map((item) => {
              const muscle = muscles.find((entry) => entry.id === item.muscleId);
              return (
                <div key={item.muscleId} className="flex items-center justify-between rounded-2xl border border-line bg-white/5 px-3 py-3">
                  <span className="text-sm font-medium text-ink">{muscle?.name}</span>
                  <span className="rounded-full bg-violet/12 px-2 py-1 text-xs font-semibold capitalize text-lavender">
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
