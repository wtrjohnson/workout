import { WorkoutLogger } from "@/components/workout-logger";
import { getSessions } from "@/lib/db/queries";
import { getNextWorkout } from "@/lib/training/logic";

export default async function WorkoutPage() {
  const sessions = await getSessions();
  const workout = getNextWorkout(sessions);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-surface px-4 pb-8 pt-6 text-ink" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
      <header className="mb-5">
        <p className="mono-copy text-xs font-semibold uppercase tracking-widest text-label">Workout mode</p>
        <h1 className="chunky-title mt-1 text-4xl font-black leading-[0.9] text-ink">{workout.title}</h1>
        <p className="mt-1 text-sm text-label">{workout.focus}</p>
      </header>
      <div className="flex flex-1 flex-col gap-4">
        <WorkoutLogger workout={workout} />
      </div>
    </main>
  );
}
