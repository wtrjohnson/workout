import { db } from "./index";
import { performedSets, workoutSessions, workoutTemplates } from "./schema";
import type { PlannedExercise, WorkoutSession, WorkoutTemplate } from "@/lib/training/types";

export async function getSessionsWithSets(): Promise<WorkoutSession[]> {
  if (!db) return [];

  const [sessions, sets] = await Promise.all([
    db.select().from(workoutSessions).orderBy(workoutSessions.date),
    db.select().from(performedSets),
  ]);

  const setsBySession = new Map<string, typeof sets>();
  for (const set of sets) {
    const arr = setsBySession.get(set.workoutSessionId) ?? [];
    arr.push(set);
    setsBySession.set(set.workoutSessionId, arr);
  }

  return sessions.map((session) => {
    const dateStr = session.date.toISOString().split("T")[0];
    return {
      id: session.id,
      templateId: session.workoutTemplateId ?? "",
      date: dateStr,
      status: session.status,
      notes: session.notes ?? undefined,
      performedSets: (setsBySession.get(session.id) ?? [])
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((set) => ({
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          date: dateStr,
        })),
    };
  });
}

export async function getTemplates(): Promise<WorkoutTemplate[]> {
  if (!db) return [];

  const templates = await db.select().from(workoutTemplates).orderBy(workoutTemplates.dayKey);
  return templates.map((t) => ({
    id: t.id,
    day: t.dayKey as "A" | "B" | "C",
    title: t.title,
    focus: t.focus,
    exercises: t.plannedExercises as PlannedExercise[],
  }));
}
