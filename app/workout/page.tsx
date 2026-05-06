import { BottomNav } from "@/components/bottom-nav";
import { WorkoutLogger } from "@/components/workout-logger";
import { getTodayWorkout } from "@/lib/training/logic";

export default function WorkoutPage() {
  const workout = getTodayWorkout(new Date("2026-05-05T12:00:00"));

  return (
    <main className="safe-bottom mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-[#0f0f14] px-4 pb-28 pt-6 text-white">
      <header className="mb-5">
        <p className="mono-copy text-xs font-semibold uppercase tracking-widest text-white/40">Workout mode</p>
        <h1 className="chunky-title mt-1 text-4xl font-black leading-[0.9] text-white">{workout.title}</h1>
        <p className="mt-1 text-sm text-white/55">{workout.focus}</p>
      </header>
      <div className="flex flex-1 flex-col gap-4">
        <WorkoutLogger workout={workout} />
      </div>
      <BottomNav />
    </main>
  );
}
