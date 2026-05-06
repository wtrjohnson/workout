import { describe, expect, it } from "vitest";
import { exercises, demoSessions, muscles, workoutTemplates } from "@/lib/training/data";
import {
  calculateRecovery,
  calculateWeeklyMuscleVolume,
  buildWorkoutSteps,
  findSubstitutions,
  generateInsights,
  getExerciseStats,
  getRestSeconds,
  getSuggestedSet,
  getTodayWorkout,
  getWeeklySummary,
  suggestProgression
} from "@/lib/training/logic";

describe("training rules", () => {
  it("selects a planned full-body workout", () => {
    const workout = getTodayWorkout(new Date("2026-05-05T12:00:00"));
    expect(workout.title).toMatch(/Full Body/);
    expect(workout.exercises.length).toBeGreaterThan(3);
  });

  it("suggests double progression based on prior sets", () => {
    const planned = {
      exerciseId: "lat-pulldown",
      targetSets: 3,
      repRange: [10, 12] as [number, number],
      intensity: "hard" as const
    };

    expect(suggestProgression(planned, demoSessions)).toContain("Repeat");
  });

  it("builds one workout step per planned set", () => {
    const workout = workoutTemplates[0];
    const steps = buildWorkoutSteps(workout);
    const plannedSets = workout.exercises.reduce((sum, exercise) => sum + exercise.targetSets, 0);

    expect(steps).toHaveLength(plannedSets);
    expect(steps[0]).toMatchObject({ exerciseIndex: 0, setIndex: 0, stepIndex: 0 });
    expect(steps.at(-1)?.stepIndex).toBe(plannedSets - 1);
  });

  it("suggests editable set defaults from last performance", () => {
    const suggested = getSuggestedSet(
      { exerciseId: "lat-pulldown", targetSets: 3, repRange: [10, 12], intensity: "hard" },
      0,
      demoSessions
    );

    expect(suggested.weight).toBeGreaterThan(0);
    expect(suggested.reps).toBeGreaterThanOrEqual(10);
    expect(suggested.reason).toContain("rep");
  });

  it("sets rest duration from intensity and movement type", () => {
    expect(getRestSeconds({ exerciseId: "lat-pulldown", targetSets: 3, repRange: [10, 12], intensity: "hard" })).toBe(120);
    expect(getRestSeconds({ exerciseId: "cable-crunch", targetSets: 3, repRange: [10, 15], intensity: "hard" })).toBe(60);
    expect(getRestSeconds({ exerciseId: "db-curl", targetSets: 2, repRange: [10, 15], intensity: "moderate" })).toBe(75);
  });

  it("summarizes exercise history for the stats button", () => {
    const stats = getExerciseStats("lat-pulldown", demoSessions);

    expect(stats.sessionsLogged).toBe(2);
    expect(stats.lastSets).toHaveLength(3);
    expect(stats.bestSet?.weight).toBe(95);
    expect(stats.volumeChangePercent).not.toBeNull();
  });

  it("builds weekly summary from completed sessions", () => {
    const summary = getWeeklySummary(demoSessions, new Date("2026-05-05T12:00:00"));

    expect(summary.completedSessions).toBeGreaterThan(0);
    expect(summary.completedSets).toBeGreaterThan(0);
    expect(summary.dailySetCounts).toHaveLength(7);
  });

  it("finds substitutions that preserve movement or target muscles", () => {
    const substitutions = findSubstitutions("db-romanian-deadlift", ["lower_back"]);
    expect(substitutions.length).toBeGreaterThan(0);
    expect(substitutions.every((exercise) => !exercise.jointStress?.includes("lower_back"))).toBe(true);
  });

  it("calculates muscle volume statuses", () => {
    const volume = calculateWeeklyMuscleVolume(demoSessions, new Date("2026-05-05T12:00:00"));
    const lats = volume.find((item) => item.muscleId === "lats");
    expect(lats?.sets).toBeGreaterThan(0);
    expect(lats?.status).toBeDefined();
  });

  it("calculates recovery for recently trained muscles", () => {
    const recovery = calculateRecovery(demoSessions, new Date("2026-05-05T12:00:00"));
    const chest = recovery.find((item) => item.muscleId === "chest");
    expect(chest?.lastTrainedDaysAgo).not.toBeNull();
    expect(chest?.score).toBeLessThanOrEqual(100);
  });

  it("generates rules-based insights", () => {
    const insights = generateInsights(demoSessions, new Date("2026-05-05T12:00:00"));
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every((insight) => insight.message.length > 20)).toBe(true);
  });
});

describe("seed data quality", () => {
  it("gives every exercise muscles, equipment, movement pattern, cues, and substitutions", () => {
    for (const exercise of exercises) {
      expect(exercise.primaryMuscles.length).toBeGreaterThan(0);
      expect(exercise.equipment.length).toBeGreaterThan(0);
      expect(exercise.movementPattern).toBeTruthy();
      expect(exercise.techniqueCues.length).toBeGreaterThanOrEqual(2);
      expect(exercise.alternatives.length).toBeGreaterThan(0);
    }
  });

  it("keeps templates pointed at valid exercises", () => {
    const ids = new Set(exercises.map((exercise) => exercise.id));
    for (const template of workoutTemplates) {
      for (const planned of template.exercises) {
        expect(ids.has(planned.exerciseId)).toBe(true);
      }
    }
  });

  it("uses canonical muscles", () => {
    const ids = new Set(muscles.map((muscle) => muscle.id));
    for (const exercise of exercises) {
      for (const muscle of [...exercise.primaryMuscles, ...exercise.secondaryMuscles]) {
        expect(ids.has(muscle)).toBe(true);
      }
    }
  });
});
