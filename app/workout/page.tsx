import { AppShell } from "@/components/app-shell";
import { WorkoutLogger } from "@/components/workout-logger";
import { getTodayWorkout } from "@/lib/training/logic";

export default function WorkoutPage() {
  const workout = getTodayWorkout(new Date("2026-05-05T12:00:00"));

  return (
    <AppShell eyebrow="Workout mode" title={workout.title}>
      <p className="-mt-3 text-sm leading-6 text-fog/70">{workout.focus}</p>
      <WorkoutLogger workout={workout} />
    </AppShell>
  );
}
