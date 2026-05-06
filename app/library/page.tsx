import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { exercises } from "@/lib/training/data";

export default function LibraryPage() {
  return (
    <AppShell eyebrow="Exercise library" title="Planet Fitness-ready lifts">
      <label className="glass-panel flex items-center gap-2 rounded-full px-4 py-2">
        <Search className="size-4 text-sand" />
        <input className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-fog/48" placeholder="Search by lift, muscle, equipment" />
      </label>

      <section className="space-y-3">
        {exercises.map((exercise) => (
          <article key={exercise.id} className="glass-panel card-hover animate-rise-in rounded-[1.5rem] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold leading-tight text-ink">{exercise.name}</h2>
                <p className="mt-1 text-sm capitalize text-fog/65">{exercise.movementPattern.replaceAll("_", " ")}</p>
              </div>
              <span className="rounded-full border border-sand/20 bg-sand/12 px-2 py-1 text-xs font-semibold text-sand">
                PF
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {exercise.primaryMuscles.map((muscle) => (
                <span key={muscle} className="rounded-full bg-violet/14 px-2 py-1 text-xs font-semibold text-lavender">
                  {muscle.replaceAll("_", " ")}
                </span>
              ))}
              {exercise.secondaryMuscles.slice(0, 3).map((muscle) => (
                <span key={muscle} className="rounded-full bg-white/7 px-2 py-1 text-xs font-medium text-fog/70">
                  {muscle.replaceAll("_", " ")}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-fog/72">{exercise.techniqueCues.join(" ")}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
