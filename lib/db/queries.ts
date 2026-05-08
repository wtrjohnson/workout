import { desc, inArray } from "drizzle-orm";
import { demoSessions } from "@/lib/training/data";
import type { WorkoutSession } from "@/lib/training/types";
import { db } from "./index";
import { performedSets, workoutSessions } from "./schema";

export type SaveSessionInput = {
  templateKey: string;
  date: string;
  durationMinutes: number | null;
  notes: string | null;
  painFlags: string[];
  perceivedEffort: string | null;
  swappedExercises: Record<string, string>;
  sets: Array<{ exerciseId: string; setNumber: number; weight: number; reps: number }>;
};

export async function getSessions(): Promise<WorkoutSession[]> {
  if (!db) return demoSessions;

  const sessions = await db
    .select()
    .from(workoutSessions)
    .orderBy(desc(workoutSessions.date));

  if (sessions.length === 0) return demoSessions;

  const sessionIds = sessions.map((s) => s.id);
  const allSets = await db
    .select()
    .from(performedSets)
    .where(inArray(performedSets.workoutSessionId, sessionIds));

  const setsBySession = new Map<string, typeof allSets>();
  for (const s of allSets) {
    const bucket = setsBySession.get(s.workoutSessionId) ?? [];
    bucket.push(s);
    setsBySession.set(s.workoutSessionId, bucket);
  }

  return sessions.map((session): WorkoutSession => ({
    id: session.id,
    templateId: session.templateKey,
    date: session.date.toISOString().split("T")[0],
    status: session.status,
    notes: session.notes ?? undefined,
    perceivedEffort: (session.perceivedEffort as WorkoutSession["perceivedEffort"]) ?? undefined,
    swappedExerciseIds: Object.keys(session.swappedExercises).length > 0
      ? session.swappedExercises
      : undefined,
    performedSets: (setsBySession.get(session.id) ?? [])
      .sort((a, b) => a.setNumber - b.setNumber)
      .map((s) => ({
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        date: session.date.toISOString().split("T")[0]
      }))
  }));
}

export async function saveSession(input: SaveSessionInput): Promise<string> {
  if (!db) {
    console.warn("saveSession: DATABASE_URL not configured, session not persisted");
    return "offline";
  }

  const [session] = await db
    .insert(workoutSessions)
    .values({
      templateKey: input.templateKey,
      date: new Date(input.date),
      status: "completed",
      durationMinutes: input.durationMinutes,
      notes: input.notes,
      painFlags: input.painFlags,
      perceivedEffort: input.perceivedEffort,
      swappedExercises: input.swappedExercises
    })
    .returning({ id: workoutSessions.id });

  if (input.sets.length > 0) {
    await db.insert(performedSets).values(
      input.sets.map((s) => ({
        workoutSessionId: session.id,
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps
      }))
    );
  }

  return session.id;
}
