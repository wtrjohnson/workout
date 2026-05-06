export type GoalPriority =
  | "fat_loss"
  | "muscle_gain"
  | "strength"
  | "endurance"
  | "mobility"
  | "posture"
  | "general_health"
  | "sports_performance"
  | "consistency";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "smith_machine"
  | "bodyweight"
  | "band"
  | "cardio";

export type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "lunge"
  | "carry"
  | "core_flexion"
  | "core_anti_extension"
  | "core_anti_rotation"
  | "isolation"
  | "cardio";

export type MuscleId =
  | "chest"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "lats"
  | "upper_back"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs"
  | "obliques"
  | "lower_back";

export type Muscle = {
  id: MuscleId;
  name: string;
  region: "upper" | "lower" | "core";
};

export type Exercise = {
  id: string;
  name: string;
  equipment: Equipment[];
  movementPattern: MovementPattern;
  primaryMuscles: MuscleId[];
  secondaryMuscles: MuscleId[];
  techniqueCues: string[];
  alternatives: string[];
  planetFitnessReady: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  jointStress?: ("shoulder" | "knee" | "lower_back" | "elbow" | "wrist")[];
};

export type PlannedExercise = {
  exerciseId: string;
  targetSets: number;
  repRange: [number, number];
  intensity: "easy" | "moderate" | "hard";
};

export type WorkoutTemplate = {
  id: string;
  day: "A" | "B" | "C";
  title: string;
  focus: string;
  exercises: PlannedExercise[];
};

export type PerformedSet = {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  date: string;
};

export type WorkoutSession = {
  id: string;
  templateId: string;
  date: string;
  status: "completed" | "planned" | "missed";
  performedSets: PerformedSet[];
  swappedExerciseIds?: Record<string, string>;
  notes?: string;
};

export type VolumeStatus = "under_target" | "on_track" | "high" | "overreaching";

export type MuscleVolume = {
  muscleId: MuscleId;
  sets: number;
  status: VolumeStatus;
};

export type RecoveryStatus = "fresh" | "ready" | "fatigued" | "very_fatigued";

export type MuscleRecovery = {
  muscleId: MuscleId;
  status: RecoveryStatus;
  score: number;
  lastTrainedDaysAgo: number | null;
};

export type Insight = {
  id: string;
  type: "progress" | "balance" | "recovery" | "consistency";
  tone: "data" | "encouraging" | "tough_love";
  title: string;
  message: string;
};
