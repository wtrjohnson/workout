/**
 * One-time database setup endpoint.
 * Creates schema + seeds all GROUNDWORK data.
 *
 * Call ONCE after first deploy:
 *   POST /api/setup
 *   Header: x-setup-key: <APP_PASSCODE>
 *
 * Returns 409 if data already exists, 200 on success.
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import {
  exercises as exercisesTable,
  muscles as musclesTable,
  performedSets,
  programs,
  userProfiles,
  workoutSessions,
  workoutTemplates,
} from "@/lib/db/schema";
import { exercises, muscles } from "@/lib/training/data";

export async function POST(request: NextRequest) {
  // Auth: require APP_PASSCODE in x-setup-key header
  const key = request.headers.get("x-setup-key");
  if (!process.env.APP_PASSCODE || key !== process.env.APP_PASSCODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }

  const sqlClient = neon(process.env.DATABASE_URL);
  const db = drizzle(sqlClient, {
    schema: { exercises: exercisesTable, muscles: musclesTable, performedSets, programs, userProfiles, workoutSessions, workoutTemplates },
  });

  // ── Idempotency check ────────────────────────────────────────────────────
  try {
    const existing = await db.select().from(userProfiles).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: "Already seeded — nothing to do." }, { status: 409 });
    }
  } catch {
    // Table doesn't exist yet — continue with schema creation
  }

  // ── Create schema ────────────────────────────────────────────────────────
  const schemaStatements = [
    `DO $$ BEGIN
       CREATE TYPE goal_priority AS ENUM (
         'fat_loss','muscle_gain','strength','endurance','mobility',
         'posture','general_health','sports_performance','consistency'
       );
     EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

    `DO $$ BEGIN
       CREATE TYPE workout_status AS ENUM ('planned','completed','missed');
     EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

    `CREATE TABLE IF NOT EXISTS user_profiles (
      id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      email                  TEXT          NOT NULL UNIQUE,
      name                   TEXT,
      age                    INTEGER,
      weight_lbs             REAL,
      goal_priority          goal_priority NOT NULL DEFAULT 'muscle_gain',
      training_days_per_week INTEGER       NOT NULL DEFAULT 3,
      experience_level       TEXT          NOT NULL DEFAULT 'beginner',
      equipment_access       JSONB         NOT NULL DEFAULT '[]',
      preferred_tone         TEXT          NOT NULL DEFAULT 'data_analyst',
      created_at             TIMESTAMP     NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS muscles (
      id     TEXT PRIMARY KEY,
      name   TEXT NOT NULL,
      region TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS exercises (
      id                   TEXT    PRIMARY KEY,
      name                 TEXT    NOT NULL,
      equipment            JSONB   NOT NULL,
      movement_pattern     TEXT    NOT NULL,
      primary_muscles      JSONB   NOT NULL,
      secondary_muscles    JSONB   NOT NULL,
      technique_cues       JSONB   NOT NULL,
      alternatives         JSONB   NOT NULL,
      planet_fitness_ready BOOLEAN NOT NULL DEFAULT TRUE,
      difficulty           TEXT    NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS programs (
      id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      user_profile_id      UUID          NOT NULL REFERENCES user_profiles(id),
      name                 TEXT          NOT NULL,
      goal_priority        goal_priority NOT NULL DEFAULT 'muscle_gain',
      schedule             JSONB         NOT NULL,
      progression_strategy TEXT          NOT NULL DEFAULT 'double_progression',
      created_at           TIMESTAMP     NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS workout_templates (
      id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id        UUID  NOT NULL REFERENCES programs(id),
      day_key           TEXT  NOT NULL,
      title             TEXT  NOT NULL,
      focus             TEXT  NOT NULL,
      planned_exercises JSONB NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS workout_sessions (
      id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
      user_profile_id     UUID           NOT NULL REFERENCES user_profiles(id),
      workout_template_id UUID           REFERENCES workout_templates(id),
      date                TIMESTAMP      NOT NULL DEFAULT NOW(),
      status              workout_status NOT NULL DEFAULT 'planned',
      duration_minutes    INTEGER,
      notes               TEXT,
      pain_flags          JSONB          NOT NULL DEFAULT '[]'
    )`,

    `CREATE TABLE IF NOT EXISTS performed_sets (
      id                 UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
      workout_session_id UUID    NOT NULL REFERENCES workout_sessions(id),
      exercise_id        TEXT    NOT NULL REFERENCES exercises(id),
      set_number         INTEGER NOT NULL,
      weight             REAL    NOT NULL,
      reps               INTEGER NOT NULL,
      rpe                REAL,
      duration_seconds   INTEGER,
      hit_failure        BOOLEAN NOT NULL DEFAULT FALSE
    )`,

    `CREATE TABLE IF NOT EXISTS progression_rules (
      id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id  TEXT    REFERENCES exercises(id),
      strategy     TEXT    NOT NULL DEFAULT 'double_progression',
      increment_lb INTEGER NOT NULL DEFAULT 5,
      notes        TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS insights (
      id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
      user_profile_id UUID      NOT NULL REFERENCES user_profiles(id),
      type            TEXT      NOT NULL,
      tone            TEXT      NOT NULL,
      title           TEXT      NOT NULL,
      message         TEXT      NOT NULL,
      created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
      dismissed_at    TIMESTAMP
    )`,
  ];

  for (const stmt of schemaStatements) {
    await sqlClient.query(stmt);
  }

  // ── Seed data ────────────────────────────────────────────────────────────

  // Muscles + exercises
  await db.insert(musclesTable).values(muscles).onConflictDoNothing();
  const exerciseRows = exercises.map(({ jointStress: _js, ...e }) => e);
  await db.insert(exercisesTable).values(exerciseRows).onConflictDoNothing();

  // User profile
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

  // Program
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

  // Templates
  type RepRange = [number, number];
  const templateRows = [
    {
      programId: program.id,
      dayKey: "A",
      title: "Day A — Squat Focus",
      focus: "Goblet squat, horizontal push/pull, core",
      plannedExercises: [
        { exerciseId: "goblet-squat",     targetSets: 4, repRange: [5,  6]  as RepRange, intensity: "hard"     },
        { exerciseId: "db-bench-press",   targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "lat-pulldown",     targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "leg-raise",        targetSets: 3, repRange: [12, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "db-curl",          targetSets: 2, repRange: [12, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "front-plank",      targetSets: 3, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-left",  targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-right", targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "dead-bugs",        targetSets: 3, repRange: [12, 12] as RepRange, intensity: "moderate" },
      ],
    },
    {
      programId: program.id,
      dayKey: "B",
      title: "Day B — Bench Focus",
      focus: "Dumbbell bench press, incline, rows, arms",
      plannedExercises: [
        { exerciseId: "db-bench-press",   targetSets: 4, repRange: [5,  6]  as RepRange, intensity: "hard"     },
        { exerciseId: "db-incline-press", targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "db-row",           targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "db-skull-crusher", targetSets: 3, repRange: [12, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "face-pulls",       targetSets: 2, repRange: [15, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "front-plank",      targetSets: 3, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-left",  targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-right", targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "dead-bugs",        targetSets: 3, repRange: [12, 12] as RepRange, intensity: "moderate" },
      ],
    },
    {
      programId: program.id,
      dayKey: "C",
      title: "Day C — Deadlift Focus",
      focus: "Dumbbell deadlift, overhead press, machine row, posterior chain",
      plannedExercises: [
        { exerciseId: "db-deadlift",       targetSets: 4, repRange: [5,  6]  as RepRange, intensity: "hard"     },
        { exerciseId: "db-overhead-press", targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "machine-row",       targetSets: 3, repRange: [8,  10] as RepRange, intensity: "hard"     },
        { exerciseId: "db-lateral-raise",  targetSets: 3, repRange: [12, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "glute-bridge",      targetSets: 2, repRange: [12, 15] as RepRange, intensity: "moderate" },
        { exerciseId: "front-plank",       targetSets: 3, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-left",   targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "side-plank-right",  targetSets: 2, repRange: [1,  1]  as RepRange, intensity: "moderate" },
        { exerciseId: "dead-bugs",         targetSets: 3, repRange: [12, 12] as RepRange, intensity: "moderate" },
      ],
    },
  ];

  const insertedTemplates = await db.insert(workoutTemplates).values(templateRows).returning();
  const templateByDay = Object.fromEntries(insertedTemplates.map((t) => [t.dayKey, t.id]));

  // Sessions + sets
  type SetRow = { exerciseId: string; setNumber: number; weight: number; reps: number; durationSeconds?: number };

  const wSets = (id: string, sets: [number, number][]): SetRow[] =>
    sets.map(([reps, weight], i) => ({ exerciseId: id, setNumber: i + 1, weight, reps }));
  const dSets = (id: string, durations: number[]): SetRow[] =>
    durations.map((d, i) => ({ exerciseId: id, setNumber: i + 1, weight: 0, reps: 0, durationSeconds: d }));
  const rSets = (id: string, weight: number, repsArr: number[]): SetRow[] =>
    repsArr.map((reps, i) => ({ exerciseId: id, setNumber: i + 1, weight, reps }));

  const sessionDefs = [
    {
      date: "2026-05-04", dayType: "A", durationMinutes: 45,
      notes: "Strong comeback session. Conservative weight choices. Good form, no pain except left knee on Bulgarian.",
      painFlags: ["left_knee"],
      sets: [
        { exerciseId: "goblet-squat", setNumber: 1, weight: 30, reps: 5 },
        { exerciseId: "goblet-squat", setNumber: 2, weight: 30, reps: 6 },
        { exerciseId: "goblet-squat", setNumber: 3, weight: 30, reps: 6 },
        { exerciseId: "goblet-squat", setNumber: 4, weight: 35, reps: 6 },
        ...wSets("db-bench-press", [[10, 20], [10, 25], [10, 25]]),
        ...rSets("bulgarian-split-squat", 20, [10, 10, 10]),
        ...rSets("db-curl", 20, [12, 12]),
        ...dSets("front-plank",      [30, 30, 30]),
        ...dSets("side-plank-left",  [20, 20]),
        ...dSets("side-plank-right", [20, 20]),
        ...rSets("dead-bugs", 0, [12, 12]),
      ],
    },
    {
      date: "2026-05-05", dayType: "A", durationMinutes: 45,
      notes: "Aggressive progression on main lift (hit 45×6). Crushed all targets. Knee felt fine with leg raises.",
      painFlags: [],
      sets: [
        ...wSets("goblet-squat",    [[6, 40], [6, 40], [6, 45], [6, 45]]),
        ...wSets("db-bench-press",  [[10, 30], [10, 35], [10, 35]]),
        ...wSets("lat-pulldown",    [[10, 55], [10, 85], [10, 85]]),
        ...rSets("leg-raise", 0, [15, 15, 15]),
        ...rSets("db-curl", 20, [15, 15]),
        ...dSets("front-plank",      [35, 40, 40]),
        ...dSets("side-plank-left",  [25, 25]),
        ...dSets("side-plank-right", [25, 25]),
        ...rSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },
    {
      date: "2026-05-07", dayType: "B", durationMinutes: 45,
      notes: "Strong bench progression (35→45 in one session). Skull crusher fatigue normal after heavy pressing.",
      painFlags: [],
      sets: [
        ...wSets("db-bench-press",   [[6, 35], [6, 40], [6, 45], [6, 45]]),
        ...wSets("db-incline-press", [[10, 25], [10, 30], [10, 30]]),
        ...rSets("db-row", 40, [10, 10, 10]),
        { exerciseId: "db-skull-crusher", setNumber: 1, weight: 15, reps: 15 },
        { exerciseId: "db-skull-crusher", setNumber: 2, weight: 15, reps: 13 },
        { exerciseId: "db-skull-crusher", setNumber: 3, weight: 15, reps: 8  },
        { exerciseId: "face-pulls", setNumber: 1, weight: 15, reps: 15 },
        { exerciseId: "face-pulls", setNumber: 2, weight: 20, reps: 15 },
        ...dSets("front-plank",      [45, 45, 45]),
        ...dSets("side-plank-left",  [25, 25]),
        ...dSets("side-plank-right", [25, 25]),
        ...rSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },
    {
      date: "2026-05-09", dayType: "C", durationMinutes: 45,
      notes: "Solid Day C. Deadlift baseline established. Conservative approach smart for CNS-taxing movement. All targets hit.",
      painFlags: [],
      sets: [
        ...rSets("db-deadlift",       40, [6, 6, 6, 6]),
        ...wSets("db-overhead-press", [[10, 25], [10, 25], [10, 30]]),
        ...rSets("db-lateral-raise",  15, [15, 15, 15]),
        ...rSets("machine-row",       85, [10, 10, 10]),
        ...rSets("glute-bridge",      15, [15, 15]),
        ...dSets("front-plank",       [50, 50, 50]),
        { exerciseId: "side-plank-left",  setNumber: 1, weight: 0, reps: 0, durationSeconds: 30 },
        { exerciseId: "side-plank-left",  setNumber: 2, weight: 0, reps: 0, durationSeconds: 28 },
        ...dSets("side-plank-right",  [30, 30]),
        ...rSets("dead-bugs", 0, [12, 12, 12]),
      ],
    },
  ];

  const sessionResults: string[] = [];
  for (const def of sessionDefs) {
    const [session] = await db
      .insert(workoutSessions)
      .values({
        userProfileId: profile.id,
        workoutTemplateId: templateByDay[def.dayType],
        date: new Date(def.date),
        status: "completed",
        durationMinutes: def.durationMinutes,
        notes: def.notes,
        painFlags: def.painFlags,
      })
      .returning();

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

    sessionResults.push(`${def.date} (Day ${def.dayType})`);
  }

  const totalSets = sessionDefs.reduce((n, s) => n + s.sets.length, 0);

  return NextResponse.json({
    message: "Setup complete",
    profile: "Will, age 24, 205 lbs",
    program: "GROUNDWORK",
    templates: ["Day A", "Day B", "Day C"],
    sessions: sessionResults,
    totalSets,
  });
}
