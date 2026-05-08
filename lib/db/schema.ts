import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const goalPriorityEnum = pgEnum("goal_priority", [
  "fat_loss",
  "muscle_gain",
  "strength",
  "endurance",
  "mobility",
  "posture",
  "general_health",
  "sports_performance",
  "consistency"
]);

export const workoutStatusEnum = pgEnum("workout_status", ["planned", "completed", "missed"]);

// Kept for future multi-user expansion — not actively used yet
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  goalPriority: goalPriorityEnum("goal_priority").notNull().default("muscle_gain"),
  trainingDaysPerWeek: integer("training_days_per_week").notNull().default(3),
  experienceLevel: text("experience_level").notNull().default("beginner"),
  equipmentAccess: jsonb("equipment_access").$type<string[]>().notNull().default([]),
  preferredTone: text("preferred_tone").notNull().default("data_analyst"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const muscles = pgTable("muscles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull()
});

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  equipment: jsonb("equipment").$type<string[]>().notNull(),
  movementPattern: text("movement_pattern").notNull(),
  primaryMuscles: jsonb("primary_muscles").$type<string[]>().notNull(),
  secondaryMuscles: jsonb("secondary_muscles").$type<string[]>().notNull(),
  techniqueCues: jsonb("technique_cues").$type<string[]>().notNull(),
  alternatives: jsonb("alternatives").$type<string[]>().notNull(),
  planetFitnessReady: boolean("planet_fitness_ready").notNull().default(true),
  difficulty: text("difficulty").notNull()
});

// Core session tables — single-user, no FK to userProfiles or DB workout templates
export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateKey: text("template_key").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: workoutStatusEnum("status").notNull().default("completed"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  painFlags: jsonb("pain_flags").$type<string[]>().notNull().default([]),
  perceivedEffort: text("perceived_effort"),
  swappedExercises: jsonb("swapped_exercises").$type<Record<string, string>>().notNull().default({})
});

export const performedSets = pgTable("performed_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutSessionId: uuid("workout_session_id").notNull().references(() => workoutSessions.id),
  exerciseId: text("exercise_id").notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull()
});

// Kept for future use — not actively written to yet
export const progressionRules = pgTable("progression_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: text("exercise_id"),
  strategy: text("strategy").notNull().default("double_progression"),
  incrementLb: integer("increment_lb").notNull().default(5),
  notes: text("notes")
});
