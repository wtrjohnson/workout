import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { performedSets, userProfiles, workoutSessions } from "@/lib/db/schema";

export async function POST(request: Request) {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });

  const { templateId, sets, painFlags, effort } = await request.json() as {
    templateId: string;
    sets: Array<{ exerciseId: string; setNumber: number; weight: number; reps: number; durationSeconds?: number }>;
    painFlags: string[];
    effort?: string;
  };

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

  return NextResponse.json({ sessionId: session.id });
}
