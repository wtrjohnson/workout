import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import {
  coachMessages,
  performedSets,
  programs,
  userProfiles,
  workoutSessions,
  workoutTemplates,
} from "./schema";
import type { CoachReply, PlannedExercise, WorkoutSession, WorkoutTemplate } from "@/lib/training/types";

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
      perceivedEffort: session.perceivedEffort as WorkoutSession["perceivedEffort"] ?? undefined,
      swappedExerciseIds: (session.swappedExerciseIds as Record<string, string>) ?? {},
      performedSets: (setsBySession.get(session.id) ?? [])
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((set) => ({
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          durationSeconds: set.durationSeconds ?? undefined,
          date: dateStr,
        })),
    };
  });
}

export type HistorySession = {
  id: string;
  date: Date;
  status: string;
  templateTitle: string | null;
  templateFocus: string | null;
  perceivedEffort: string | null;
  painFlags: string[];
  setCount: number;
};

export type HistorySessionDetail = HistorySession & {
  performedSets: Array<{
    id: string;
    exerciseId: string;
    setNumber: number;
    weight: number;
    reps: number;
    durationSeconds: number | null;
  }>;
  swappedExerciseIds: Record<string, string>;
};

export async function getSessionHistory(): Promise<HistorySession[]> {
  if (!db) return [];

  const rows = await db
    .select({
      id: workoutSessions.id,
      date: workoutSessions.date,
      status: workoutSessions.status,
      templateTitle: workoutTemplates.title,
      templateFocus: workoutTemplates.focus,
      perceivedEffort: workoutSessions.perceivedEffort,
      painFlags: workoutSessions.painFlags,
    })
    .from(workoutSessions)
    .leftJoin(workoutTemplates, eq(workoutSessions.workoutTemplateId, workoutTemplates.id))
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.date))
    .limit(60);

  const sets = await db.select({ sessionId: performedSets.workoutSessionId }).from(performedSets);
  const setCountBySession = new Map<string, number>();
  for (const s of sets) {
    setCountBySession.set(s.sessionId, (setCountBySession.get(s.sessionId) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    status: row.status,
    templateTitle: row.templateTitle ?? null,
    templateFocus: row.templateFocus ?? null,
    perceivedEffort: row.perceivedEffort ?? null,
    painFlags: (row.painFlags as string[]) ?? [],
    setCount: setCountBySession.get(row.id) ?? 0,
  }));
}

export async function getSessionDetail(sessionId: string): Promise<HistorySessionDetail | null> {
  if (!db) return null;

  const rows = await db
    .select({
      id: workoutSessions.id,
      date: workoutSessions.date,
      status: workoutSessions.status,
      templateTitle: workoutTemplates.title,
      templateFocus: workoutTemplates.focus,
      perceivedEffort: workoutSessions.perceivedEffort,
      painFlags: workoutSessions.painFlags,
      swappedExerciseIds: workoutSessions.swappedExerciseIds,
    })
    .from(workoutSessions)
    .leftJoin(workoutTemplates, eq(workoutSessions.workoutTemplateId, workoutTemplates.id))
    .where(eq(workoutSessions.id, sessionId))
    .limit(1);

  if (!rows.length) return null;
  const session = rows[0];

  const sets = await db
    .select()
    .from(performedSets)
    .where(eq(performedSets.workoutSessionId, sessionId))
    .orderBy(performedSets.setNumber);

  return {
    id: session.id,
    date: session.date,
    status: session.status,
    templateTitle: session.templateTitle ?? null,
    templateFocus: session.templateFocus ?? null,
    perceivedEffort: session.perceivedEffort ?? null,
    painFlags: (session.painFlags as string[]) ?? [],
    setCount: sets.length,
    swappedExerciseIds: (session.swappedExerciseIds as Record<string, string>) ?? {},
    performedSets: sets.map((s) => ({
      id: s.id,
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      weight: s.weight,
      reps: s.reps,
      durationSeconds: s.durationSeconds ?? null,
    })),
  };
}

export async function getProgram(): Promise<{ id: string; schedule: string[] } | null> {
  if (!db) return null;
  const rows = await db.select({ id: programs.id, schedule: programs.schedule }).from(programs).limit(1);
  return rows[0] ?? null;
}

export async function getProfile(): Promise<{ id: string; trainingDaysPerWeek: number } | null> {
  if (!db) return null;
  const rows = await db
    .select({ id: userProfiles.id, trainingDaysPerWeek: userProfiles.trainingDaysPerWeek })
    .from(userProfiles)
    .limit(1);
  return rows[0] ?? null;
}

export async function getRecentCoachReplies(limit = 20): Promise<CoachReply[]> {
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: coachMessages.id,
        body: coachMessages.body,
        contextKind: coachMessages.contextKind,
        createdAt: coachMessages.createdAt,
      })
      .from(coachMessages)
      .where(eq(coachMessages.role, "user"))
      .orderBy(desc(coachMessages.createdAt))
      .limit(limit);

    return rows
      .map((row) => ({
        id: row.id,
        body: row.body,
        contextKind: row.contextKind ?? null,
        createdAt: row.createdAt.toISOString(),
      }))
      .reverse();
  } catch (err) {
    // Table may not exist yet (run `npm run db:push`). Degrade gracefully
    // so the home page still renders without chat history.
    console.warn("getRecentCoachReplies failed:", err);
    return [];
  }
}

export async function insertCoachReply({
  body,
  contextKind,
}: {
  body: string;
  contextKind?: string | null;
}): Promise<void> {
  if (!db) return;
  const profile = await getProfile();
  if (!profile) return;
  try {
    await db.insert(coachMessages).values({
      userProfileId: profile.id,
      role: "user",
      body,
      contextKind: contextKind ?? null,
    });
  } catch (err) {
    console.warn("insertCoachReply failed:", err);
  }
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
