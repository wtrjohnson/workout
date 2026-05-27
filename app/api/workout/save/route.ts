import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { performedSets, userProfiles, workoutSessions } from "@/lib/db/schema";

const VALID_EFFORTS = new Set(["easy", "comfortable", "moderate", "hard", "very_hard"]);

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });

  const { templateId, sets, painFlags, effort, swappedExerciseIds } = await request.json() as {
    templateId: string;
    sets: Array<{ exerciseId: string; setNumber: number; weight: number; reps: number; durationSeconds?: number }>;
    painFlags: string[];
    effort?: string;
    swappedExerciseIds?: Record<string, string>;
  };

  if (!Array.isArray(sets)) {
    return NextResponse.json({ error: "sets must be an array" }, { status: 400 });
  }
  for (const s of sets) {
    if (s.weight < 0 || s.reps < 0 || (s.durationSeconds !== undefined && s.durationSeconds < 0)) {
      return NextResponse.json({ error: "invalid set values" }, { status: 400 });
    }
  }
  if (effort && !VALID_EFFORTS.has(effort)) {
    return NextResponse.json({ error: "invalid effort value" }, { status: 400 });
  }

  const profiles = await db.select({ id: userProfiles.id }).from(userProfiles).limit(1);
  if (!profiles.length) return NextResponse.json({ error: "no profile" }, { status: 404 });

  const [session] = await db
    .insert(workoutSessions)
    .values({
      userProfileId: profiles[0].id,
      workoutTemplateId: templateId || null,
      date: new Date(),
      status: "completed",
      painFlags: painFlags ?? [],
      perceivedEffort: effort ?? null,
      swappedExerciseIds: swappedExerciseIds ?? {},
    })
    .returning();

  if (sets.length > 0) {
    await db.insert(performedSets).values(
      sets.map((s) => ({
        workoutSessionId: session.id,
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        weight: s.weight,
        reps: s.reps,
        durationSeconds: s.durationSeconds ?? null,
      }))
    );
  }

  revalidatePath("/");
  return NextResponse.json({ sessionId: session.id });
}
