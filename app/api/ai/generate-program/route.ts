import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs, userProfiles, workoutTemplates } from "@/lib/db/schema";
import { exercises } from "@/lib/training/data";

const client = new Anthropic();

export async function POST() {
  if (!db) return NextResponse.json({ error: "no db" }, { status: 503 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  const profiles = await db.select().from(userProfiles).limit(1);
  if (!profiles.length) return NextResponse.json({ error: "no profile" }, { status: 404 });
  const profile = profiles[0];

  const programRows = await db.select().from(programs).limit(1);
  if (!programRows.length) return NextResponse.json({ error: "no program" }, { status: 404 });
  const program = programRows[0];

  const numTemplates = profile.trainingDaysPerWeek <= 2 ? 2 : profile.trainingDaysPerWeek <= 4 ? 3 : 3;
  const dayKeys = ["A", "B", "C"].slice(0, numTemplates);
  const splitType = profile.trainingDaysPerWeek <= 3 ? "full-body" : "push/pull/legs";

  const catalogSummary = exercises
    .filter((e) => {
      const equip = profile.equipmentAccess as string[];
      return equip.length === 0 || e.equipment.some((eq) => equip.includes(eq)) || e.equipment.includes("bodyweight");
    })
    .map((e) => ({
      id: e.id,
      name: e.name,
      pattern: e.movementPattern,
      muscles: e.primaryMuscles,
      equipment: e.equipment,
      isTimeBased: e.isTimeBased ?? false,
    }));

  const prompt = `You are an expert strength coach. Create a ${splitType} workout program for the following athlete.

Goal: ${profile.goalPriority.replace(/_/g, " ")}
Training days per week: ${profile.trainingDaysPerWeek}
Experience level: ${profile.experienceLevel}
Available equipment: ${(profile.equipmentAccess as string[]).join(", ") || "all"}

Create exactly ${numTemplates} workout template(s) with day keys: ${dayKeys.join(", ")}.
Each template needs 5-7 exercises chosen from the catalog below.
${splitType === "full-body" ? "Each template should hit upper and lower body with some core work." : "Template A = Push (chest/shoulders/triceps), B = Pull (back/biceps), C = Legs (quads/hamstrings/glutes)."}

Exercise catalog (Planet Fitness equipment):
${JSON.stringify(catalogSummary)}

Respond with ONLY valid JSON — no markdown, no prose:
{
  "templates": [
    {
      "dayKey": "A",
      "title": "short title (2-3 words)",
      "focus": "muscles hit",
      "exercises": [
        {
          "exerciseId": "exact-id-from-catalog",
          "targetSets": 3,
          "repRange": [8, 12],
          "intensity": "moderate"
        }
      ]
    }
  ]
}

Rules:
- exerciseId must exactly match an id from the catalog
- isTimeBased exercises MUST use repRange [0, 0]
- intensity: "easy" | "moderate" | "hard"
- targetSets: 2–5
- For ${profile.goalPriority.replace(/_/g, " ")}: ${
    profile.goalPriority === "strength" ? "heavier loads (3-6 reps), more sets (4-5)" :
    profile.goalPriority === "fat_loss" ? "moderate weight, higher reps (12-20), shorter rest" :
    "moderate weight, hypertrophy rep ranges (8-15)"
  }`;

  const message = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "no text in response" }, { status: 500 });
  }

  let generated: {
    templates: Array<{
      dayKey: string;
      title: string;
      focus: string;
      exercises: Array<{ exerciseId: string; targetSets: number; repRange: [number, number]; intensity: string }>;
    }>;
  };

  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    generated = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text);
  } catch {
    return NextResponse.json({ error: "failed to parse AI response" }, { status: 500 });
  }

  const validIds = new Set(exercises.map((e) => e.id));
  const validIntensities = new Set(["easy", "moderate", "hard"]);
  for (const template of generated.templates) {
    template.exercises = template.exercises.filter(
      (ex) => validIds.has(ex.exerciseId) && validIntensities.has(ex.intensity)
    );
  }

  await db.delete(workoutTemplates).where(eq(workoutTemplates.programId, program.id));

  if (generated.templates.length > 0) {
    await db.insert(workoutTemplates).values(
      generated.templates.map((t) => ({
        programId: program.id,
        dayKey: t.dayKey,
        title: t.title,
        focus: t.focus,
        plannedExercises: t.exercises,
      }))
    );
  }

  return NextResponse.json({ ok: true, templatesCreated: generated.templates.length });
}
