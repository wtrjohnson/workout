export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) return;

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);

    const migrations = [
      `ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS perceived_effort TEXT`,
      `ALTER TABLE workout_sessions ADD COLUMN IF NOT EXISTS swapped_exercise_ids JSONB NOT NULL DEFAULT '{}'`,
      `ALTER TABLE exercises ADD COLUMN IF NOT EXISTS is_time_based BOOLEAN NOT NULL DEFAULT FALSE`,
    ];

    for (const migration of migrations) {
      await sql(migration);
    }
  } catch {
    // Non-fatal: app still works if migrations fail (tables may not exist yet)
  }
}
