import type { Muscle, MuscleVolume } from "@/lib/training/types";

export function MuscleHeatmap({ volume, muscles }: { volume: MuscleVolume[]; muscles: Muscle[] }) {
  return (
    <section className="glass-panel rounded-[1.5rem] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Training balance</h2>
          <p className="text-xs text-fog/65">Weekly hard-set heatmap</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {muscles.map((muscle) => {
          const item = volume.find((entry) => entry.muscleId === muscle.id);
          const sets = item?.sets ?? 0;
          return (
            <div key={muscle.id} className={`rounded-2xl border px-2 py-3 ${colorForSets(sets)}`}>
              <p className="truncate text-xs font-medium">{muscle.name}</p>
              <p className="mt-1 text-lg font-semibold">{sets}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function colorForSets(sets: number): string {
  if (sets < 3) return "border-line bg-white/5 text-fog/62";
  if (sets < 6) return "border-violet/20 bg-violet/12 text-lavender";
  if (sets <= 14) return "border-sand/30 bg-sand/14 text-sand";
  if (sets <= 20) return "border-moss/30 bg-moss/14 text-moss";
  return "border-ember/60 bg-ember/20 text-ember";
}
