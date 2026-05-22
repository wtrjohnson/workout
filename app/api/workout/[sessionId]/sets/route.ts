import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { performedSets } from "@/lib/db/schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });

  const { sessionId } = await params;
  const { sets } = await request.json() as {
    sets: Array<{ id: string; weight: number; reps: number; durationSeconds?: number }>;
  };

  if (!Array.isArray(sets) || sets.length === 0) {
    return NextResponse.json({ error: "sets must be a non-empty array" }, { status: 400 });
  }

  for (const s of sets) {
    if (typeof s.id !== "string" || s.weight < 0 || s.reps < 0) {
      return NextResponse.json({ error: "invalid set values" }, { status: 400 });
    }
  }

  await Promise.all(
    sets.map((s) =>
      db!
        .update(performedSets)
        .set({
          weight: s.weight,
          reps: s.reps,
          durationSeconds: s.durationSeconds ?? null,
        })
        .where(
          and(
            eq(performedSets.id, s.id),
            eq(performedSets.workoutSessionId, sessionId)
          )
        )
    )
  );

  return NextResponse.json({ ok: true });
}
