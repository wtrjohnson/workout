import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";

const VALID_PRIORITIES = new Set([
  "fat_loss", "muscle_gain", "strength", "endurance",
  "mobility", "posture", "general_health", "sports_performance", "consistency"
]);

export async function GET() {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });
  const profiles = await db.select().from(userProfiles).limit(1);
  if (!profiles.length) return NextResponse.json({ error: "no profile" }, { status: 404 });
  return NextResponse.json(profiles[0]);
}

export async function PATCH(request: Request) {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });

  const body = await request.json() as {
    goalPriority?: string;
    trainingDaysPerWeek?: number;
    equipmentAccess?: string[];
  };

  if (body.goalPriority !== undefined && !VALID_PRIORITIES.has(body.goalPriority)) {
    return NextResponse.json({ error: "invalid goalPriority" }, { status: 400 });
  }
  if (body.trainingDaysPerWeek !== undefined && (body.trainingDaysPerWeek < 1 || body.trainingDaysPerWeek > 7)) {
    return NextResponse.json({ error: "trainingDaysPerWeek must be 1-7" }, { status: 400 });
  }

  const profiles = await db.select({ id: userProfiles.id }).from(userProfiles).limit(1);
  if (!profiles.length) return NextResponse.json({ error: "no profile" }, { status: 404 });

  const updates: Partial<typeof userProfiles.$inferInsert> = {};
  if (body.goalPriority !== undefined) updates.goalPriority = body.goalPriority as typeof userProfiles.$inferInsert["goalPriority"];
  if (body.trainingDaysPerWeek !== undefined) updates.trainingDaysPerWeek = body.trainingDaysPerWeek;
  if (body.equipmentAccess !== undefined) updates.equipmentAccess = body.equipmentAccess;

  await db.update(userProfiles).set(updates).where(eq(userProfiles.id, profiles[0].id));
  return NextResponse.json({ ok: true });
}
