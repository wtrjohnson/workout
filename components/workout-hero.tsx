import { ArrowRight, Dumbbell } from "lucide-react";
import Link from "next/link";
import type { WorkoutTemplate } from "@/lib/training/types";

export function WorkoutHero({
  workout,
  headline,
  exercises
}: {
  workout: WorkoutTemplate;
  headline: string;
  exercises: string[];
}) {
  return (
    <section className="relative overflow-hidden py-2">
      <div className="mb-8 flex items-center justify-between">
        <span className="rounded-full border border-sand/20 bg-sand/10 px-3 py-1 text-xs font-semibold text-sand">
          Today’s plan
        </span>
        <div className="grid size-11 place-items-center rounded-full bg-white/8 text-sand">
          <Dumbbell className="size-5" aria-hidden />
        </div>
      </div>

      <h2 className="max-w-[18rem] text-6xl font-semibold leading-[0.9] tracking-normal text-ink">{headline}</h2>
      <p className="mt-5 max-w-xs text-base leading-7 text-fog/74">{workout.focus}</p>

      <div className="mt-7 space-y-3 border-y border-line py-5">
        {exercises.map((exercise, index) => (
          <div key={exercise} className="flex items-baseline gap-3">
            <span className="text-xs font-bold text-sand">{String(index + 1).padStart(2, "0")}</span>
            <p className="text-xl font-semibold leading-tight text-ink">{exercise}</p>
          </div>
        ))}
      </div>

      <Link
        href="/workout"
        className="tap-target mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-sand px-6 py-4 text-sm font-bold text-night shadow-glow transition active:scale-[0.98]"
      >
        Start workout
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
