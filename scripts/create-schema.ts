/**
 * Creates all database tables directly via SQL over the Neon HTTP API.
 * Use this instead of `drizzle-kit push` when running in Node.js.
 *
 * Usage: npm run db:push
 */

import { readFileSync } from "fs";

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
  } catch {}
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set.");
  process.exit(1);
}

import { neon } from "@neondatabase/serverless";

const sql = neon(DATABASE_URL);

async function createSchema() {
  console.log("🏗️   Creating database schema...\n");

  const statements = [
    // Enums
    `CREATE TYPE IF NOT EXISTS goal_priority AS ENUM (
      'fat_loss','muscle_gain','strength','endurance','mobility',
      'posture','general_health','sports_performance','consistency'
    )`,
    `CREATE TYPE IF NOT EXISTS workout_status AS ENUM ('planned','completed','missed')`,

    // user_profiles
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      email           TEXT        NOT NULL UNIQUE,
      name            TEXT,
      age             INTEGER,
      weight_lbs      REAL,
      goal_priority   goal_priority NOT NULL DEFAULT 'muscle_gain',
      training_days_per_week INTEGER NOT NULL DEFAULT 3,
      experience_level TEXT       NOT NULL DEFAULT 'beginner',
      equipment_access JSONB      NOT NULL DEFAULT '[]',
      preferred_tone  TEXT        NOT NULL DEFAULT 'data_analyst',
      created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
    )`,

    // muscles
    `CREATE TABLE IF NOT EXISTS muscles (
      id     TEXT PRIMARY KEY,
      name   TEXT NOT NULL,
      region TEXT NOT NULL
    )`,

    // exercises
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

    // programs
    `CREATE TABLE IF NOT EXISTS programs (
      id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      user_profile_id      UUID          NOT NULL REFERENCES user_profiles(id),
      name                 TEXT          NOT NULL,
      goal_priority        goal_priority NOT NULL DEFAULT 'muscle_gain',
      schedule             JSONB         NOT NULL,
      progression_strategy TEXT          NOT NULL DEFAULT 'double_progression',
      created_at           TIMESTAMP     NOT NULL DEFAULT NOW()
    )`,

    // workout_templates
    `CREATE TABLE IF NOT EXISTS workout_templates (
      id                UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
      program_id        UUID  NOT NULL REFERENCES programs(id),
      day_key           TEXT  NOT NULL,
      title             TEXT  NOT NULL,
      focus             TEXT  NOT NULL,
      planned_exercises JSONB NOT NULL
    )`,

    // workout_sessions
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

    // performed_sets
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

    // progression_rules
    `CREATE TABLE IF NOT EXISTS progression_rules (
      id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id  TEXT    REFERENCES exercises(id),
      strategy     TEXT    NOT NULL DEFAULT 'double_progression',
      increment_lb INTEGER NOT NULL DEFAULT 5,
      notes        TEXT
    )`,

    // add perceived_effort to existing workout_sessions tables
    `ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS perceived_effort TEXT`,

    // insights
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

    // coach_messages — persisted user replies to the coach feed (chat history)
    `CREATE TABLE IF NOT EXISTS coach_messages (
      id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
      user_profile_id UUID      NOT NULL REFERENCES user_profiles(id),
      role            TEXT      NOT NULL,
      body            TEXT      NOT NULL,
      context_kind    TEXT,
      created_at      TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const stmt of statements) {
    const label = stmt.trim().split("\n")[0].slice(0, 60);
    try {
      await sql.query(stmt);
      console.log(`  ✓ ${label}`);
    } catch (err: unknown) {
      // Enums throw if they already exist (Postgres doesn't support IF NOT EXISTS for types < 14)
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists")) {
        console.log(`  ~ ${label} (already exists, skipped)`);
      } else {
        console.error(`  ✗ ${label}`);
        throw err;
      }
    }
  }

  console.log("\n✅  Schema ready.");
}

createSchema().catch((err) => {
  console.error("❌  Schema creation failed:", err);
  process.exit(1);
});
