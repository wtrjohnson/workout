import { AppShell } from "@/components/app-shell";
import { DarkChartCard } from "@/components/dark-chart-card";
import { MetricRing } from "@/components/metric-ring";
import { LiftProgressChart, MuscleVolumeChart } from "@/components/progress-charts";
import { demoSessions, muscles } from "@/lib/training/data";
import { calculateRecovery, calculateWeeklyMuscleVolume } from "@/lib/training/logic";

const statusColors: Record<string, { bg: string; text: string }> = {
  fresh: { bg: "bg-[#e8fdf0]", text: "text-[#16a34a]" },
  ready: { bg: "bg-[#e8eeff]", text: "text-[#2563eb]" },
  fatigued: { bg: "bg-[#fef3e2]", text: "text-[#d97706]" },
  recovering: { bg: "bg-[#fef3e2]", text: "text-[#d97706]" },
  overreached: { bg: "bg-[#fee2e2]", text: "text-[#dc2626]" }
};

export default function ProgressPage() {
  const today = new Date("2026-05-05T12:00:00");
  const volume = calculateWeeklyMuscleVolume(demoSessions, today);
  const recovery = calculateRecovery(demoSessions, today);
  const readiness = Math.round((recovery.filter((item) => item.status === "fresh" || item.status === "ready").length / recovery.length) * 100);
  const volumeTarget = Math.round((volume.filter((item) => item.status === "on_track" || item.status === "high").length / volume.length) * 100);
  const consistency = Math.min(100, Math.round((demoSessions.filter((session) => session.status === "completed").length / 3) * 100));

  return (
    <AppShell eyebrow="Analytics" title="Progress">
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
