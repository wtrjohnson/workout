/**
 * Seed script: pushes Will's GROUNDWORK program + full session history into the database.
 *
 * Usage:
 *   1. Create .env.local with DATABASE_URL="postgres://..."
 *   2. npm run db:push      (creates tables via drizzle-kit)
 *   3. npm run seed         (inserts all data)
 */

import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  exercises as exercisesTable,
  muscles as musclesTable,
  performedSets,
  programs,
  userProfiles,
  workoutSessions,
  workoutTemplates,
} from "../lib/db/schema";
import { exercises, muscles } from "../lib/training/data";

// ---------------------------------------------------------------------------
// Load .env.local (Next.js convention). Does nothing if file is absent.
// ---------------------------------------------------------------------------
function loadEnvFile(path: string) {
  try {
    const content = readFileSync(path, "utf-8");
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not present — rely on env already being set
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

// ---------------------------------------------------------------------------
// DB connection
// ---------------------------------------------------------------------------
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set. Create .env.local or export it.");
  process.exit(1);
}

const db = drizzle(neon(DATABASE_URL), {
  schema: { exercises: exercisesTable, muscles: musclesTable, performedSets, programs, userProfiles, workoutSessions, workoutTemplates },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type Set = { exerciseId: string; setNumber: number; weight: number; reps: number; durationSeconds?: number };

function weightSets(exerciseId: string, sets: [number, number][]): Set[] {
  // sets: [reps, weight][]
  return sets.map(([reps, weight], i) => ({ exerciseId, setNumber: i + 1, weight, reps }));
}

function durationSets(exerciseId: string, durations: number[]): Set[] {
  return durations.map((d, i) => ({ exerciseId, setNumber: i + 1, weight: 0, reps: 0, durationSeconds: d }));
}

function repSets(exerciseId: string, weight: number, repsArr: number[]): Set[] {
  return repsArr.map((reps, i) => ({ exerciseId, setNumber: i + 1, weight, reps }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function seed() {
  console.log("🌱  Starting seed...\n");

  // 1. Muscles ---------------------------------------------------------------
  console.log("  Inserting muscles...");
  await db
    .insert(musclesTable)
    .values(muscles)
    .onConflictDoNothing();

  // 2. Exercises -------------------------------------------------------------
  console.log("  Inserting exercises...");
  const exerciseRows = exercises.map(({ jointStress: _js, ...e }) => e);
  await db
    .insert(exercisesTable)
    .values(exerciseRows)
    .onConflictDoNothing();

  // 3. User profile ----------------------------------------------------------
  console.log("  Inserting user profile...");
  const [profile] = await db
    .insert(userProfiles)
    .values({
      email: "will@groundwork.local",
      name: "Will",
      age: 24,
      weightLbs: 205,
      goalPriority: "muscle_gain",
      trainingDaysPerWeek: 3,
      experienceLevel: "intermediate",
      equipmentAccess: ["dumbbell", "machine", "cable", "smith_machine"],
      preferredTone: "data_analyst",
    })
    .onConflictDoUpdate({
      target: userProfiles.email,
      set: { name: "Will", age: 24, weightLbs: 205 },
    })
    .returning();

  // 4. Program ---------------------------------------------------------------
  console.log("  Inserting GROUNDWORK program...");
  const [program] = await db
    .insert(programs)
    .values({
      userProfileId: profile.id,
      name: "GROUNDWORK",
      goalPriority: "muscle_gain",
      schedule: ["Monday", "Wednesday", "Friday"],
      progressionStrategy: "linear_progression",
    })
    .returning();

  // 5. Workout templates (A / B / C) ----------------------------------------
  console.log("  Inserting workout templates...");
  const templateRows = [
    {
      programId: program.id,
      dayKey: "A",
      title: "Day A — Squat Focus",
      focus: "Goblet squat, horizontal push/pull, core",
      plannedExercises: [
        { exerciseId: "goblet-squat",    targetSets: 4, repRange: [5,  6]  as [number,number], intensity: "hard"     },
        { exerciseId: "db-bench-press",  targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "lat-pulldown",    targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "leg-raise",       targetSets: 3, repRange: [12, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "db-curl",         targetSets: 2, repRange: [12, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "front-plank",     targetSets: 3, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-left", targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-right",targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "dead-bugs",       targetSets: 3, repRange: [12, 12] as [number,number], intensity: "moderate" },
      ],
    },
    {
      programId: program.id,
      dayKey: "B",
      title: "Day B — Bench Focus",
      focus: "Dumbbell bench press, incline, rows, arms",
      plannedExercises: [
        { exerciseId: "db-bench-press",   targetSets: 4, repRange: [5,  6]  as [number,number], intensity: "hard"     },
        { exerciseId: "db-incline-press", targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "db-row",           targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "db-skull-crusher", targetSets: 3, repRange: [12, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "face-pulls",       targetSets: 2, repRange: [15, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "front-plank",      targetSets: 3, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-left",  targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-right", targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "dead-bugs",        targetSets: 3, repRange: [12, 12] as [number,number], intensity: "moderate" },
      ],
    },
    {
      programId: program.id,
      dayKey: "C",
      title: "Day C — Deadlift Focus",
      focus: "Dumbbell deadlift, overhead press, machine row, posterior chain",
      plannedExercises: [
        { exerciseId: "db-deadlift",       targetSets: 4, repRange: [5,  6]  as [number,number], intensity: "hard"     },
        { exerciseId: "db-overhead-press", targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "machine-row",       targetSets: 3, repRange: [8,  10] as [number,number], intensity: "hard"     },
        { exerciseId: "db-lateral-raise",  targetSets: 3, repRange: [12, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "glute-bridge",      targetSets: 2, repRange: [12, 15] as [number,number], intensity: "moderate" },
        { exerciseId: "front-plank",       targetSets: 3, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-left",   targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "side-plank-right",  targetSets: 2, repRange: [1,  1]  as [number,number], intensity: "moderate" },
        { exerciseId: "dead-bugs",         targetSets: 3, repRange: [12, 12] as [number,number], intensity: "moderate" },
      ],
    },
  ];

  const insertedTemplates = await db
    .insert(workoutTemplates)
    .values(templateRows)
    .returning();

  const templateByDay = Object.fromEntries(insertedTemplates.map((t) => [t.dayKey, t.id]));

  // 6. Workout sessions + performed sets -------------------------------------
  const sessionDefs: Array<{
    date: string;
    dayType: "A" | "B" | "C";
    notes: string;
    durationMinutes: number;
    sets: Set[];
  }> = [
    // ── Session 1 · 2026-05-04 · Day A ──────────────────────────────────────
    {
      date: "2026-05-04",
      dayType: "A",
      durationMinutes: 45,
      notes: "Strong comeback session. Conservative weight choices. Good form, no pain except left knee on Bulgarian.",
      sets: [
        // Goblet squat — ramped last set
        { exerciseId: "goblet-squat", setNumber: 1, weight: 30, reps: 5 },
        { exerciseId: "goblet-squat", setNumber: 2, weight: 30, reps: 6 },
        { exerciseId: "goblet-squat", setNumber: 3, weight: 30, reps: 6 },
        { exerciseId: "goblet-squat", setNumber: 4, weight: 35, reps: 6 },
        // DB Bench (accessory)
        ...weightSets("db-bench-press", [[10, 20], [10, 25], [10, 25]]),
        // Bulgarian split squat (swapped out after this session)
        ...repSets("bulgarian-split-squat", 20, [10, 10, 10]),
        // Bicep curl
        ...repSets("db-curl", 20, [12, 12]),
        // Core
        ...durationSets("front-plank",      [30, 30, 30]),
        ...durationSets("side-plank-left",  [20, 20]),
        ...durationSets("side-plank-right", [20, 20]),
        ...repSets("dead-bugs", 0, [12, 12]),
      ],
    },

    // ── Session 2 · 2026-05-05 · Day A ──────────────────────────────────────
    {
      date: "2026-05-05",
      dayType: "A",
      durationMinutes: 45,
      notes: "Aggressive progression on main lift (hit 45×6). Crushed all targets. Knee felt fine with leg raises.",
      sets: [
        // Goblet squat — big jump
        ...weightSets("goblet-squat", [[6, 40], [6, 40], [6, 45], [6, 45]]),
        // DB Bench (accessory)
        ...weightSets("db-bench-press", [[10, 30], [10, 35], [10, 35]]),
        // Lat pulldown (added this session)
        ...weightSets("lat-pulldown", [[10, 55], [10, 85], [10, 85]]),
        // Leg raise (replaced Bulgarian)
        ...repSets("leg-raise", 0, [15, 15, 15]),
        // Bicep curl
        ...repSets("db-curl", 20, [15, 15]),
        // Core
        ...durationSets("front-plank",      [35, 40, 40]),
        ...durationSets("side-plank-left",  [25, 25]),
        ...durationSets("side-plank-right", [25, 25]),
        ...repSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },

    // ── Session 3 · 2026-05-07 · Day B ──────────────────────────────────────
    {
      date: "2026-05-07",
      dayType: "B",
      durationMinutes: 45,
      notes: "Strong bench progression (35→45 in one session). Skull crusher fatigue normal after heavy pressing. Overall excellent session.",
      sets: [
        // DB Bench (main lift — ramped)
        ...weightSets("db-bench-press", [[6, 35], [6, 40], [6, 45], [6, 45]]),
        // Incline press
        ...weightSets("db-incline-press", [[10, 25], [10, 30], [10, 30]]),
        // DB rows
        ...repSets("db-row", 40, [10, 10, 10]),
        // Skull crushers (fatigue by set 3)
        { exerciseId: "db-skull-crusher", setNumber: 1, weight: 15, reps: 15 },
        { exerciseId: "db-skull-crusher", setNumber: 2, weight: 15, reps: 13 },
        { exerciseId: "db-skull-crusher", setNumber: 3, weight: 15, reps: 8  },
        // Face pulls (ramped weight)
        { exerciseId: "face-pulls", setNumber: 1, weight: 15, reps: 15 },
        { exerciseId: "face-pulls", setNumber: 2, weight: 20, reps: 15 },
        // Core
        ...durationSets("front-plank",      [45, 45, 45]),
        ...durationSets("side-plank-left",  [25, 25]),
        ...durationSets("side-plank-right", [25, 25]),
        ...repSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },

    // ── Session 4 · 2026-05-09 · Day C ──────────────────────────────────────
    {
      date: "2026-05-09",
      dayType: "C",
      durationMinutes: 45,
      notes: "Solid Day C. Deadlift baseline established. Conservative approach smart for CNS-taxing movement. All targets hit.",
      sets: [
        // DB deadlift (conservative baseline)
        ...repSets("db-deadlift", 40, [6, 6, 6, 6]),
        // OHP — ramped set 3
        ...weightSets("db-overhead-press", [[10, 25], [10, 25], [10, 30]]),
        // Lateral raise
        ...repSets("db-lateral-raise", 15, [15, 15, 15]),
        // Machine row
        ...repSets("machine-row", 85, [10, 10, 10]),
        // Glute bridge
        ...repSets("glute-bridge", 15, [15, 15]),
        // Core
        ...durationSets("front-plank",      [50, 50, 50]),
        { exerciseId: "side-plank-left",  setNumber: 1, weight: 0, reps: 0, durationSeconds: 30 },
        { exerciseId: "side-plank-left",  setNumber: 2, weight: 0, reps: 0, durationSeconds: 28 },
        ...durationSets("side-plank-right", [30, 30]),
        ...repSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },
  ];

  for (const def of sessionDefs) {
    console.log(`  Inserting session ${def.date} (Day ${def.dayType})...`);

    const [session] = await db
      .insert(workoutSessions)
      .values({
        userProfileId: profile.id,
        workoutTemplateId: templateByDay[def.dayType],
        date: new Date(def.date),
        status: "completed",
        durationMinutes: def.durationMinutes,
        notes: def.notes,
        painFlags: def.dayType === "A" && def.date === "2026-05-04" ? ["left_knee"] : [],
      })
      .returning();

    if (def.sets.length > 0) {
      await db.insert(performedSets).values(
        def.sets.map((s) => ({
          workoutSessionId: session.id,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weight: s.weight,
          reps: s.reps,
          durationSeconds: s.durationSeconds ?? null,
        }))
      );
    }
  }

  console.log("\n✅  Seed complete!");
  console.log(`    Profile : Will (age 24, 205 lbs)`);
  console.log(`    Program : GROUNDWORK`);
  console.log(`    Templates: Day A, B, C`);
  console.log(`    Sessions : 4 (${sessionDefs.map((s) => s.date).join(", ")})`);
  const totalSets = sessionDefs.reduce((n, s) => n + s.sets.length, 0);
  console.log(`    Sets     : ${totalSets} performed sets`);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
