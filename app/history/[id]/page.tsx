import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { getSessionDetail } from "@/lib/db/queries";
import { exercises } from "@/lib/training/data";

const exerciseById = new Map(exercises.map((e) => [e.id, e]));

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function effortLabel(effort: string | null): string {
  const map: Record<string, string> = {
    easy: "Easy",
    comfortable: "Comfortable",
    moderate: "Just right",
    hard: "Hard",
    very_hard: "Wrecked",
  };
  return effort ? (map[effort] ?? effort) : "—";
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionDetail(id);
  if (!session) notFound();

  const exerciseIds = [...new Set(session.performedSets.map((s) => s.exerciseId))];
  const totalVolume = session.performedSets.reduce((sum, s) => {
    if (s.weight === 0 && s.reps === 0 && s.durationSeconds) return sum + s.durationSeconds;
    return sum + s.weight * s.reps;
  }, 0);

  return (
    <main className="safe-bottom mx-auto min-h-screen w-full max-w-md bg-surface px-4 pb-28 pt-6 text-ink">
      <header className="mb-6">
        <Link href="/history" className="mb-4 flex items-center gap-1 text-sm text-label">
          <ArrowLeft className="size-4" aria-hidden />
          History
        </Link>
        <p className="mono-copy text-xs font-semibold uppercase tracking-widest text-label">
          {formatDate(session.date)}
        </p>
        <h1 className="chunky-title mt-1 text-4xl font-black leading-[0.9] text-ink">
          {session.templateTitle ?? "Freestyle session"}
        </h1>
        {session.templateFocus && (
          <p className="mt-1 text-sm text-label">{session.templateFocus}</p>
        )}
      </header>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-black/6 bg-white p-3 shadow-card">
          <p className="text-xl font-black leading-none text-ink">{session.setCount}</p>
          <p className="mt-1 text-xs font-semibold text-label">Sets</p>
        </div>
        <div className="rounded-2xl border border-black/6 bg-white p-3 shadow-card">
          <p className="text-xl font-black leading-none text-ink">
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : Math.round(totalVolume)}
          </p>
          <p className="mt-1 text-xs font-semibold text-label">Volume</p>
        </div>
        <div className="rounded-2xl border border-black/6 bg-white p-3 shadow-card">
          <p className="text-xl font-black leading-none text-ink">{effortLabel(session.perceivedEffort)}</p>
          <p className="mt-1 text-xs font-semibold text-label">Feel</p>
        </div>
      </div>

      {session.painFlags.length > 0 && (
        <div className="mb-4 rounded-2xl border border-[#d97706]/20 bg-[#fffbeb] p-3">
          <p className="text-xs font-semibold text-[#d97706]">
            Pain flags: {session.painFlags.map((f) => f.replace("_", " ")).join(", ")}
          </p>
        </div>
      )}

      <section className="space-y-3">
        {exerciseIds.map((exId) => {
          const exercise = exerciseById.get(exId);
          const sets = session.performedSets.filter((s) => s.exerciseId === exId);
          const isTimeBased = exercise?.isTimeBased ?? false;
          const swappedFrom = Object.entries(session.swappedExerciseIds).find(([, to]) => to === exId)?.[0];
          const originalName = swappedFrom ? exerciseById.get(swappedFrom)?.name : null;

          return (
            <article key={exId} className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-ink">{exercise?.name ?? exId}</h2>
                  {originalName && (
                    <p className="mt-0.5 text-xs text-label">swap from {originalName}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-label">
                  {sets.length} {sets.length === 1 ? "set" : "sets"}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {sets.map((set) => (
                  <div key={set.setNumber} className="flex items-center gap-2 text-sm">
                    <span className="mono-copy w-5 text-xs text-label">{set.setNumber}</span>
                    <span className="font-medium text-ink">
                      {isTimeBased && set.durationSeconds
                        ? `${set.durationSeconds}s`
                        : `${set.weight} lb × ${set.reps}`}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <BottomNav />
    </main>
  );
}
