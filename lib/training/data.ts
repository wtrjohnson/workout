import type { Exercise, Muscle, PerformedSet, WorkoutSession, WorkoutTemplate } from "./types";

export const muscles: Muscle[] = [
  { id: "chest", name: "Chest", region: "upper" },
  { id: "front_delts", name: "Front delts", region: "upper" },
  { id: "side_delts", name: "Side delts", region: "upper" },
  { id: "rear_delts", name: "Rear delts", region: "upper" },
  { id: "lats", name: "Lats", region: "upper" },
  { id: "upper_back", name: "Upper back", region: "upper" },
  { id: "biceps", name: "Biceps", region: "upper" },
  { id: "triceps", name: "Triceps", region: "upper" },
  { id: "quads", name: "Quads", region: "lower" },
  { id: "hamstrings", name: "Hamstrings", region: "lower" },
  { id: "glutes", name: "Glutes", region: "lower" },
  { id: "calves", name: "Calves", region: "lower" },
  { id: "abs", name: "Abs", region: "core" },
  { id: "obliques", name: "Obliques", region: "core" },
  { id: "lower_back", name: "Lower back", region: "core" }
];

export const exercises: Exercise[] = [
  // ── Existing library ─────────────────────────────────────────────────────────
  {
    id: "smith-squat",
    name: "Smith Machine Squat",
    equipment: ["smith_machine"],
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "abs"],
    techniqueCues: ["Brace before each rep.", "Keep knees tracking over toes.", "Use a depth you can control."],
    alternatives: ["leg-press", "goblet-squat"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["knee", "lower_back"]
  },
  {
    id: "leg-press",
    name: "Leg Press",
    equipment: ["machine"],
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings", "calves"],
    techniqueCues: ["Control the bottom.", "Do not let hips roll off the pad.", "Drive through mid-foot."],
    alternatives: ["smith-squat", "goblet-squat"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["knee"]
  },
  {
    id: "db-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    equipment: ["dumbbell"],
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "upper_back"],
    techniqueCues: ["Push hips back.", "Keep dumbbells close.", "Stop when hamstrings limit the range."],
    alternatives: ["seated-leg-curl", "lying-hamstring-curl"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["lower_back"]
  },
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    equipment: ["machine"],
    movementPattern: "horizontal_push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    techniqueCues: ["Set handles near mid-chest.", "Pause briefly near the stretch.", "Keep shoulders down."],
    alternatives: ["db-bench-press", "db-incline-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "db-bench-press",
    name: "Dumbbell Bench Press",
    equipment: ["dumbbell"],
    movementPattern: "horizontal_push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    techniqueCues: ["Elbows slightly tucked.", "Press up and in.", "Use a controlled lower."],
    alternatives: ["machine-chest-press", "db-incline-press"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["shoulder", "wrist"]
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    equipment: ["cable", "machine"],
    movementPattern: "vertical_pull",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper_back", "rear_delts"],
    techniqueCues: ["Pull elbows toward ribs.", "Avoid leaning way back.", "Control the stretch overhead."],
    alternatives: ["seated-cable-row", "machine-row"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    equipment: ["cable"],
    movementPattern: "horizontal_pull",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    techniqueCues: ["Start with shoulder blades reaching.", "Row elbows back.", "Do not turn it into a lower-back swing."],
    alternatives: ["machine-row", "db-row"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["lower_back"]
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    equipment: ["machine"],
    movementPattern: "vertical_push",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "chest"],
    techniqueCues: ["Seat handles near chin height.", "Keep ribs down.", "Stop if shoulder pinches."],
    alternatives: ["db-overhead-press", "cable-lateral-raise"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "cable-lateral-raise",
    name: "Cable Lateral Raise",
    equipment: ["cable"],
    movementPattern: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: ["upper_back"],
    techniqueCues: ["Lead with elbows.", "Keep the cable behind the body.", "Use smooth reps over heavy swinging."],
    alternatives: ["db-lateral-raise", "machine-shoulder-press"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["shoulder"]
  },
  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    equipment: ["machine"],
    movementPattern: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["calves"],
    techniqueCues: ["Line knee with machine axis.", "Squeeze the curl.", "Control the return."],
    alternatives: ["lying-hamstring-curl", "db-romanian-deadlift"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    equipment: ["cable"],
    movementPattern: "core_flexion",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques"],
    techniqueCues: ["Curl ribs toward pelvis.", "Keep hips mostly still.", "Exhale hard at the bottom."],
    alternatives: ["leg-raise", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    equipment: ["cable", "band"],
    movementPattern: "core_anti_rotation",
    primaryMuscles: ["obliques", "abs"],
    secondaryMuscles: ["glutes"],
    techniqueCues: ["Stand tall.", "Press straight out.", "Resist rotation both directions."],
    alternatives: ["front-plank", "cable-crunch"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "triceps-rope-pressdown",
    name: "Rope Triceps Pressdown",
    equipment: ["cable"],
    movementPattern: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: ["front_delts"],
    techniqueCues: ["Pin elbows near sides.", "Spread the rope at the bottom.", "Do not chase weight with body English."],
    alternatives: ["db-skull-crusher", "machine-chest-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["elbow"]
  },
  {
    id: "db-curl",
    name: "Dumbbell Curl",
    equipment: ["dumbbell"],
    movementPattern: "isolation",
    primaryMuscles: ["biceps"],
    secondaryMuscles: ["upper_back"],
    techniqueCues: ["Keep elbows slightly forward.", "Use a full lower.", "Stop swinging before it becomes cardio."],
    alternatives: ["lat-pulldown", "seated-cable-row"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["elbow", "wrist"]
  },

  // ── GROUNDWORK plan exercises ─────────────────────────────────────────────────
  {
    id: "goblet-squat",
    name: "Dumbbell Goblet Squat",
    equipment: ["dumbbell"],
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["abs", "upper_back"],
    techniqueCues: ["Hold dumbbell vertically at chest.", "Elbows inside knees at the bottom.", "Drive up tall — don't fold forward."],
    alternatives: ["leg-press", "smith-squat"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["knee"]
  },
  {
    id: "db-deadlift",
    name: "Dumbbell Deadlift",
    equipment: ["dumbbell"],
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "upper_back", "quads"],
    techniqueCues: ["Hinge at hips, not the waist.", "Keep dumbbells close to shins.", "Lock hips and knees out at the top."],
    alternatives: ["db-romanian-deadlift", "seated-leg-curl"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["lower_back"]
  },
  {
    id: "db-incline-press",
    name: "Dumbbell Incline Press",
    equipment: ["dumbbell"],
    movementPattern: "horizontal_push",
    primaryMuscles: ["chest", "front_delts"],
    secondaryMuscles: ["triceps"],
    techniqueCues: ["Set bench to 30-45 degrees.", "Lower to upper chest.", "Press up and slightly in."],
    alternatives: ["db-bench-press", "machine-chest-press"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["shoulder"]
  },
  {
    id: "db-row",
    name: "Dumbbell Row",
    equipment: ["dumbbell"],
    movementPattern: "horizontal_pull",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    techniqueCues: ["Brace the non-working arm on bench.", "Pull elbow toward hip, not straight up.", "Hold a beat at the top."],
    alternatives: ["seated-cable-row", "machine-row"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "db-overhead-press",
    name: "Dumbbell Overhead Press",
    equipment: ["dumbbell"],
    movementPattern: "vertical_push",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps", "upper_back"],
    techniqueCues: ["Start at ear height.", "Press straight up — don't flare elbows wide.", "Keep ribs down throughout."],
    alternatives: ["machine-shoulder-press", "db-lateral-raise"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["shoulder"]
  },
  {
    id: "machine-row",
    name: "Machine Row",
    equipment: ["machine"],
    movementPattern: "horizontal_pull",
    primaryMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    techniqueCues: ["Chest against pad.", "Drive elbows back — not out.", "Control the return fully."],
    alternatives: ["db-row", "seated-cable-row"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "db-skull-crusher",
    name: "Dumbbell Skull Crusher",
    equipment: ["dumbbell"],
    movementPattern: "isolation",
    primaryMuscles: ["triceps"],
    secondaryMuscles: [],
    techniqueCues: ["Upper arms vertical.", "Lower toward forehead, not behind head.", "Squeeze at full extension."],
    alternatives: ["triceps-rope-pressdown", "machine-chest-press"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["elbow"]
  },
  {
    id: "face-pull",
    name: "Face Pull",
    equipment: ["cable", "band"],
    movementPattern: "isolation",
    primaryMuscles: ["rear_delts", "upper_back"],
    secondaryMuscles: ["biceps"],
    techniqueCues: ["Pull toward face, hands past ears.", "Lead with elbows wide.", "Pause with arms open."],
    alternatives: ["db-row", "seated-cable-row"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "db-lateral-raise",
    name: "Dumbbell Lateral Raise",
    equipment: ["dumbbell"],
    movementPattern: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: ["rear_delts"],
    techniqueCues: ["Lead with elbows, not hands.", "Stop at shoulder height.", "Avoid swinging — lighter is better here."],
    alternatives: ["cable-lateral-raise", "machine-shoulder-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "leg-raise",
    name: "Leg Raise",
    equipment: ["bodyweight"],
    movementPattern: "core_flexion",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques"],
    techniqueCues: ["Keep lower back pressed flat.", "Lower legs with control.", "Don't let momentum do the work."],
    alternatives: ["cable-crunch", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "lying-hamstring-curl",
    name: "Lying Hamstring Curl",
    equipment: ["machine"],
    movementPattern: "isolation",
    primaryMuscles: ["hamstrings"],
    secondaryMuscles: ["calves"],
    techniqueCues: ["Hips stay on pad.", "Curl all the way up.", "Control the lowering — don't drop."],
    alternatives: ["seated-leg-curl", "db-romanian-deadlift"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    equipment: ["bodyweight"],
    movementPattern: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "abs"],
    techniqueCues: ["Drive through heels.", "Squeeze glutes at the top.", "Don't hyperextend the lower back."],
    alternatives: ["lying-hamstring-curl", "db-romanian-deadlift"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },

  // ── Core finisher exercises ──────────────────────────────────────────────────
  {
    id: "front-plank",
    name: "Front Plank",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_extension",
    primaryMuscles: ["abs", "lower_back"],
    secondaryMuscles: ["glutes", "obliques"],
    techniqueCues: ["Squeeze everything — abs, glutes, quads.", "Don't let hips sag or pike.", "Breathe steadily; don't hold your breath."],
    alternatives: ["dead-bug", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "side-plank",
    name: "Side Plank",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_extension",
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["abs", "glutes"],
    techniqueCues: ["Stack feet or stagger them.", "Drive hip up — no sagging.", "Keep the top hand on hip or extended overhead."],
    alternatives: ["front-plank", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_extension",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["lower_back", "obliques"],
    techniqueCues: ["Press lower back into the floor.", "Move opposite arm and leg slowly.", "Exhale on the way down."],
    alternatives: ["front-plank", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  }
];

// ── GROUNDWORK: 3-Day Full-Body Plan ─────────────────────────────────────────

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "groundwork-a",
    day: "A",
    title: "Day A — Squat Focus",
    focus: "Goblet squat, chest, vertical pull, biceps, core",
    exercises: [
      { exerciseId: "goblet-squat",    targetSets: 4, repRange: [5, 6],   intensity: "hard" },
      { exerciseId: "db-bench-press",  targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "lat-pulldown",    targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "leg-raise",       targetSets: 3, repRange: [12, 15], intensity: "moderate" },
      { exerciseId: "db-curl",         targetSets: 2, repRange: [12, 15], intensity: "moderate" },
      { exerciseId: "front-plank",     targetSets: 3, repRange: [30, 60], intensity: "moderate" },
      { exerciseId: "side-plank",      targetSets: 4, repRange: [20, 45], intensity: "moderate" },
      { exerciseId: "dead-bug",        targetSets: 3, repRange: [12, 12], intensity: "moderate" }
    ]
  },
  {
    id: "groundwork-b",
    day: "B",
    title: "Day B — Bench Focus",
    focus: "Heavy bench, incline, rows, skull crushers, face pulls, core",
    exercises: [
      { exerciseId: "db-bench-press",    targetSets: 4, repRange: [5, 6],   intensity: "hard" },
      { exerciseId: "db-incline-press",  targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "db-row",            targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "db-skull-crusher",  targetSets: 3, repRange: [12, 15], intensity: "moderate" },
      { exerciseId: "face-pull",         targetSets: 2, repRange: [15, 15], intensity: "moderate" },
      { exerciseId: "front-plank",       targetSets: 3, repRange: [30, 60], intensity: "moderate" },
      { exerciseId: "side-plank",        targetSets: 4, repRange: [20, 45], intensity: "moderate" },
      { exerciseId: "dead-bug",          targetSets: 3, repRange: [12, 12], intensity: "moderate" }
    ]
  },
  {
    id: "groundwork-c",
    day: "C",
    title: "Day C — Deadlift Focus",
    focus: "Deadlift, overhead press, machine row, lateral raise, hamstrings, core",
    exercises: [
      { exerciseId: "db-deadlift",          targetSets: 4, repRange: [5, 6],   intensity: "hard" },
      { exerciseId: "db-overhead-press",    targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "machine-row",          targetSets: 3, repRange: [8, 10],  intensity: "hard" },
      { exerciseId: "db-lateral-raise",     targetSets: 3, repRange: [12, 15], intensity: "moderate" },
      { exerciseId: "lying-hamstring-curl", targetSets: 3, repRange: [12, 15], intensity: "moderate" },
      { exerciseId: "front-plank",          targetSets: 3, repRange: [30, 60], intensity: "moderate" },
      { exerciseId: "side-plank",           targetSets: 4, repRange: [20, 45], intensity: "moderate" },
      { exerciseId: "dead-bug",             targetSets: 3, repRange: [12, 12], intensity: "moderate" }
    ]
  }
];

// ── Historical sessions ───────────────────────────────────────────────────────
// Weights are per-dumbbell for DB exercises. Core "reps" = seconds held for planks.

export const demoSessions: WorkoutSession[] = [
  {
    id: "session-1",
    templateId: "groundwork-a",
    date: "2026-04-21",
    status: "completed",
    notes: "Strong comeback session. Conservative weight. Good form, left knee ache on Bulgarian (substituted going forward).",
    performedSets: [
      set("goblet-squat",   1, 30, 5,  "2026-04-21"),
      set("goblet-squat",   2, 30, 6,  "2026-04-21"),
      set("goblet-squat",   3, 30, 6,  "2026-04-21"),
      set("goblet-squat",   4, 35, 6,  "2026-04-21"),
      set("db-bench-press", 1, 20, 10, "2026-04-21"),
      set("db-bench-press", 2, 25, 10, "2026-04-21"),
      set("db-bench-press", 3, 25, 10, "2026-04-21"),
      set("db-curl",        1, 20, 12, "2026-04-21"),
      set("db-curl",        2, 20, 12, "2026-04-21"),
      set("front-plank",    1, 0,  30, "2026-04-21"),
      set("front-plank",    2, 0,  30, "2026-04-21"),
      set("front-plank",    3, 0,  30, "2026-04-21"),
      set("side-plank",     1, 0,  20, "2026-04-21"),
      set("side-plank",     2, 0,  20, "2026-04-21"),
      set("side-plank",     3, 0,  20, "2026-04-21"),
      set("side-plank",     4, 0,  20, "2026-04-21"),
      set("dead-bug",       1, 0,  12, "2026-04-21"),
      set("dead-bug",       2, 0,  12, "2026-04-21")
    ]
  },
  {
    id: "session-2",
    templateId: "groundwork-a",
    date: "2026-05-05",
    status: "completed",
    notes: "Aggressive progression on main lift (hit 45 × 6). Crushed all targets. Knee felt fine with leg raises.",
    performedSets: [
      set("goblet-squat",   1, 40, 6,  "2026-05-05"),
      set("goblet-squat",   2, 40, 6,  "2026-05-05"),
      set("goblet-squat",   3, 45, 6,  "2026-05-05"),
      set("goblet-squat",   4, 45, 6,  "2026-05-05"),
      set("db-bench-press", 1, 30, 10, "2026-05-05"),
      set("db-bench-press", 2, 35, 10, "2026-05-05"),
      set("db-bench-press", 3, 35, 10, "2026-05-05"),
      set("lat-pulldown",   1, 55, 10, "2026-05-05"),
      set("lat-pulldown",   2, 85, 10, "2026-05-05"),
      set("lat-pulldown",   3, 85, 10, "2026-05-05"),
      set("leg-raise",      1, 0,  15, "2026-05-05"),
      set("leg-raise",      2, 0,  15, "2026-05-05"),
      set("leg-raise",      3, 0,  15, "2026-05-05"),
      set("db-curl",        1, 20, 15, "2026-05-05"),
      set("db-curl",        2, 20, 15, "2026-05-05"),
      set("front-plank",    1, 0,  35, "2026-05-05"),
      set("front-plank",    2, 0,  40, "2026-05-05"),
      set("front-plank",    3, 0,  40, "2026-05-05"),
      set("side-plank",     1, 0,  25, "2026-05-05"),
      set("side-plank",     2, 0,  25, "2026-05-05"),
      set("side-plank",     3, 0,  25, "2026-05-05"),
      set("side-plank",     4, 0,  25, "2026-05-05"),
      set("dead-bug",       1, 0,  12, "2026-05-05"),
      set("dead-bug",       2, 0,  12, "2026-05-05"),
      set("dead-bug",       3, 0,  12, "2026-05-05")
    ]
  },
  {
    id: "session-3",
    templateId: "groundwork-b",
    date: "2026-05-07",
    status: "completed",
    notes: "Strong bench progression (35→45 in one session). Skull crusher fatigue normal after heavy pressing.",
    performedSets: [
      set("db-bench-press",   1, 35, 6,  "2026-05-07"),
      set("db-bench-press",   2, 40, 6,  "2026-05-07"),
      set("db-bench-press",   3, 45, 6,  "2026-05-07"),
      set("db-bench-press",   4, 45, 6,  "2026-05-07"),
      set("db-incline-press", 1, 25, 10, "2026-05-07"),
      set("db-incline-press", 2, 30, 10, "2026-05-07"),
      set("db-incline-press", 3, 30, 10, "2026-05-07"),
      set("db-row",           1, 40, 10, "2026-05-07"),
      set("db-row",           2, 40, 10, "2026-05-07"),
      set("db-row",           3, 40, 10, "2026-05-07"),
      set("db-skull-crusher", 1, 15, 15, "2026-05-07"),
      set("db-skull-crusher", 2, 15, 13, "2026-05-07"),
      set("db-skull-crusher", 3, 15, 8,  "2026-05-07"),
      set("face-pull",        1, 15, 15, "2026-05-07"),
      set("face-pull",        2, 20, 15, "2026-05-07"),
      set("front-plank",      1, 0,  45, "2026-05-07"),
      set("front-plank",      2, 0,  45, "2026-05-07"),
      set("front-plank",      3, 0,  45, "2026-05-07"),
      set("side-plank",       1, 0,  25, "2026-05-07"),
      set("side-plank",       2, 0,  25, "2026-05-07"),
      set("side-plank",       3, 0,  25, "2026-05-07"),
      set("side-plank",       4, 0,  25, "2026-05-07"),
      set("dead-bug",         1, 0,  12, "2026-05-07"),
      set("dead-bug",         2, 0,  12, "2026-05-07"),
      set("dead-bug",         3, 0,  12, "2026-05-07")
    ]
  }
];

function set(exerciseId: string, setNumber: number, weight: number, reps: number, date: string): PerformedSet {
  return { exerciseId, setNumber, weight, reps, date };
}
