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
    alternatives: ["seated-leg-curl", "smith-hip-thrust"],
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
    alternatives: ["db-bench-press", "push-up"],
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
    alternatives: ["machine-chest-press", "push-up"],
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
    alternatives: ["assisted-pull-up", "seated-cable-row"],
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
    alternatives: ["machine-row", "lat-pulldown"],
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
    alternatives: ["db-shoulder-press", "cable-lateral-raise"],
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
    alternatives: ["db-romanian-deadlift"],
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
    alternatives: ["plank", "pallof-press"],
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
    alternatives: ["plank", "cable-crunch"],
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
    alternatives: ["machine-chest-press"],
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
  {
    id: "goblet-squat",
    name: "Dumbbell Goblet Squat",
    equipment: ["dumbbell"],
    movementPattern: "squat",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["abs", "hamstrings"],
    techniqueCues: ["Hold dumbbell at chest height.", "Squat to depth, elbows inside knees.", "Drive through heels, chest tall."],
    alternatives: ["smith-squat", "leg-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "leg-raise",
    name: "Leg Raise",
    equipment: ["bodyweight"],
    movementPattern: "core_flexion",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques"],
    techniqueCues: ["Lower legs slow and controlled.", "Keep lower back pressed down.", "Stop before heels touch the floor."],
    alternatives: ["cable-crunch", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "db-incline-press",
    name: "Dumbbell Incline Press",
    equipment: ["dumbbell"],
    movementPattern: "horizontal_push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    techniqueCues: ["Set bench to 30-45 degrees.", "Elbows slightly tucked.", "Press up and in at the top."],
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
    techniqueCues: ["Brace on bench with opposite arm.", "Pull elbow back past hip.", "Keep torso parallel to floor."],
    alternatives: ["seated-cable-row", "machine-row"],
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
    techniqueCues: ["Pin upper arms vertical.", "Lower to temples, not forehead.", "Extend fully at the top."],
    alternatives: ["triceps-rope-pressdown"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["elbow"]
  },
  {
    id: "face-pulls",
    name: "Face Pulls / Band Pull-Aparts",
    equipment: ["cable", "band"],
    movementPattern: "isolation",
    primaryMuscles: ["rear_delts"],
    secondaryMuscles: ["upper_back"],
    techniqueCues: ["Pull to face level.", "Flare elbows high.", "Squeeze shoulder blades at peak."],
    alternatives: ["cable-lateral-raise"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "db-deadlift",
    name: "Dumbbell Deadlift",
    equipment: ["dumbbell"],
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back", "quads"],
    techniqueCues: ["Hip hinge, not a squat.", "Keep dumbbells close to legs.", "Brace hard before each rep."],
    alternatives: ["db-romanian-deadlift"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["lower_back"]
  },
  {
    id: "db-overhead-press",
    name: "Dumbbell Overhead Press",
    equipment: ["dumbbell"],
    movementPattern: "vertical_push",
    primaryMuscles: ["front_delts", "side_delts"],
    secondaryMuscles: ["triceps"],
    techniqueCues: ["Start at shoulder height.", "Press straight up, not forward.", "Ribs down, avoid lower-back extension."],
    alternatives: ["machine-shoulder-press"],
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
    techniqueCues: ["Chest against pad.", "Pull elbows back and squeeze.", "Full stretch at extension."],
    alternatives: ["seated-cable-row", "db-row"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "db-lateral-raise",
    name: "Dumbbell Lateral Raise",
    equipment: ["dumbbell"],
    movementPattern: "isolation",
    primaryMuscles: ["side_delts"],
    secondaryMuscles: ["upper_back"],
    techniqueCues: ["Lead with elbows, not wrists.", "Stop at shoulder height.", "Slight forward lean for side delt emphasis."],
    alternatives: ["cable-lateral-raise"],
    planetFitnessReady: true,
    difficulty: "beginner",
    jointStress: ["shoulder"]
  },
  {
    id: "glute-bridge",
    name: "Laying Glute Bridge",
    equipment: ["dumbbell", "bodyweight"],
    movementPattern: "isolation",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    techniqueCues: ["Place weight on hip crease.", "Drive hips up, squeeze glutes hard.", "Ribs down, avoid lower-back hyperextension."],
    alternatives: ["db-romanian-deadlift"],
    planetFitnessReady: true,
    difficulty: "beginner"
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    equipment: ["dumbbell", "bodyweight"],
    movementPattern: "lunge",
    primaryMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    techniqueCues: ["Rear foot elevated on bench.", "Front shin stays mostly vertical.", "Control the descent."],
    alternatives: ["goblet-squat", "leg-raise"],
    planetFitnessReady: true,
    difficulty: "intermediate",
    jointStress: ["knee"]
  },
  {
    id: "front-plank",
    name: "Front Plank",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_extension",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques", "lower_back"],
    techniqueCues: ["Forearms and toes.", "Squeeze glutes and abs together.", "Don't let hips sag or pike."],
    alternatives: ["cable-crunch", "dead-bugs"],
    planetFitnessReady: true,
    difficulty: "beginner",
    isTimeBased: true
  },
  {
    id: "side-plank-left",
    name: "Left Side Plank",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_rotation",
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["abs", "glutes"],
    techniqueCues: ["Stack feet or stagger.", "Drive hip up toward ceiling.", "Keep body in one straight line."],
    alternatives: ["pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    isTimeBased: true
  },
  {
    id: "side-plank-right",
    name: "Right Side Plank",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_rotation",
    primaryMuscles: ["obliques"],
    secondaryMuscles: ["abs", "glutes"],
    techniqueCues: ["Stack feet or stagger.", "Drive hip up toward ceiling.", "Keep body in one straight line."],
    alternatives: ["pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    isTimeBased: true
  },
  {
    id: "dead-bugs",
    name: "Dead Bugs",
    equipment: ["bodyweight"],
    movementPattern: "core_anti_extension",
    primaryMuscles: ["abs"],
    secondaryMuscles: ["obliques"],
    techniqueCues: ["Press lower back into floor throughout.", "Extend opposite arm and leg slowly.", "Exhale as you lower, inhale to reset."],
    alternatives: ["front-plank", "pallof-press"],
    planetFitnessReady: true,
    difficulty: "beginner",
    isTimeBased: true
  }
];

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "full-body-a",
    day: "A",
    title: "Full Body A",
    focus: "Squat, chest, vertical pull, core flexion",
    exercises: [
      { exerciseId: "smith-squat", targetSets: 3, repRange: [8, 12], intensity: "hard" },
      { exerciseId: "machine-chest-press", targetSets: 3, repRange: [8, 12], intensity: "hard" },
      { exerciseId: "lat-pulldown", targetSets: 3, repRange: [10, 12], intensity: "hard" },
      { exerciseId: "seated-leg-curl", targetSets: 2, repRange: [10, 15], intensity: "moderate" },
      { exerciseId: "cable-crunch", targetSets: 3, repRange: [10, 15], intensity: "hard" }
    ]
  },
  {
    id: "full-body-b",
    day: "B",
    title: "Full Body B",
    focus: "Hinge, shoulders, horizontal row, anti-rotation",
    exercises: [
      { exerciseId: "db-romanian-deadlift", targetSets: 3, repRange: [8, 12], intensity: "hard" },
      { exerciseId: "machine-shoulder-press", targetSets: 3, repRange: [8, 12], intensity: "hard" },
      { exerciseId: "seated-cable-row", targetSets: 3, repRange: [10, 12], intensity: "hard" },
      { exerciseId: "leg-press", targetSets: 2, repRange: [10, 15], intensity: "moderate" },
      { exerciseId: "pallof-press", targetSets: 3, repRange: [10, 15], intensity: "moderate" }
    ]
  },
  {
    id: "full-body-c",
    day: "C",
    title: "Full Body C",
    focus: "Leg press, dumbbell press, delt/biceps/triceps balance",
    exercises: [
      { exerciseId: "leg-press", targetSets: 3, repRange: [10, 15], intensity: "hard" },
      { exerciseId: "db-bench-press", targetSets: 3, repRange: [8, 12], intensity: "hard" },
      { exerciseId: "lat-pulldown", targetSets: 3, repRange: [10, 12], intensity: "hard" },
      { exerciseId: "cable-lateral-raise", targetSets: 2, repRange: [12, 20], intensity: "moderate" },
      { exerciseId: "triceps-rope-pressdown", targetSets: 2, repRange: [10, 15], intensity: "moderate" },
      { exerciseId: "db-curl", targetSets: 2, repRange: [10, 15], intensity: "moderate" },
      { exerciseId: "cable-crunch", targetSets: 2, repRange: [10, 15], intensity: "hard" }
    ]
  }
];

export const demoSessions: WorkoutSession[] = [
  {
    id: "session-1",
    templateId: "full-body-a",
    date: "2026-04-27",
    status: "completed",
    performedSets: [
      set("smith-squat", 1, 95, 10, "2026-04-27"),
      set("smith-squat", 2, 95, 9, "2026-04-27"),
      set("smith-squat", 3, 95, 8, "2026-04-27"),
      set("machine-chest-press", 1, 85, 12, "2026-04-27"),
      set("machine-chest-press", 2, 85, 11, "2026-04-27"),
      set("machine-chest-press", 3, 85, 10, "2026-04-27"),
      set("lat-pulldown", 1, 90, 12, "2026-04-27"),
      set("lat-pulldown", 2, 90, 11, "2026-04-27"),
      set("lat-pulldown", 3, 90, 10, "2026-04-27")
    ]
  },
  {
    id: "session-2",
    templateId: "full-body-b",
    date: "2026-04-30",
    status: "completed",
    performedSets: [
      set("db-romanian-deadlift", 1, 45, 12, "2026-04-30"),
      set("db-romanian-deadlift", 2, 45, 11, "2026-04-30"),
      set("db-romanian-deadlift", 3, 45, 10, "2026-04-30"),
      set("machine-shoulder-press", 1, 60, 10, "2026-04-30"),
      set("machine-shoulder-press", 2, 60, 9, "2026-04-30"),
      set("seated-cable-row", 1, 95, 12, "2026-04-30"),
      set("seated-cable-row", 2, 95, 12, "2026-04-30"),
      set("seated-cable-row", 3, 95, 11, "2026-04-30")
    ]
  },
  {
    id: "session-3",
    templateId: "full-body-c",
    date: "2026-05-03",
    status: "completed",
    performedSets: [
      set("leg-press", 1, 180, 15, "2026-05-03"),
      set("leg-press", 2, 180, 14, "2026-05-03"),
      set("leg-press", 3, 180, 13, "2026-05-03"),
      set("db-bench-press", 1, 45, 12, "2026-05-03"),
      set("db-bench-press", 2, 45, 12, "2026-05-03"),
      set("db-bench-press", 3, 45, 11, "2026-05-03"),
      set("lat-pulldown", 1, 95, 12, "2026-05-03"),
      set("lat-pulldown", 2, 95, 12, "2026-05-03"),
      set("lat-pulldown", 3, 95, 11, "2026-05-03"),
      set("cable-lateral-raise", 1, 15, 16, "2026-05-03"),
      set("cable-lateral-raise", 2, 15, 15, "2026-05-03")
    ]
  }
];

function set(exerciseId: string, setNumber: number, weight: number, reps: number, date: string): PerformedSet {
  return { exerciseId, setNumber, weight, reps, date };
}
