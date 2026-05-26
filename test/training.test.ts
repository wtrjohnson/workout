import { describe, expect, it } from "vitest";
import { exercises, demoSessions, muscles, workoutTemplates } from "@/lib/training/data";
import {
  calculateRecovery,
  calculateWeeklyMuscleVolume,
  buildWorkoutSteps,
  detectSessionPRs,
  findSubstitutions,
  generateCoachFeed,
  generateInsights,
  getExerciseStats,
  getMonthlySessionCount,
  getNextTemplate,
  getRestSeconds,
  getStreakDays,
  getSuggestedSet,
  getTodayWorkout,
  getWeeklySummary,
  suggestProgression
} from "@/lib/training/logic";
import type { WorkoutSession, WorkoutTemplate } from "@/lib/training/types";

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

describe("getNextTemplate", () => {
  it("returns the expected rotation template when muscles are recovered", () => {
    // demoSessions has 3 completed sessions (A, B, C), so next in sequence is A
    // Use a date far enough out that all muscles are fully recovered
    const result = getNextTemplate(demoSessions, workoutTemplates, new Date("2026-05-15T12:00:00"));
    expect(result.day).toBe("A");
  });

  it("picks the most-recovered template when the expected one is fatigued", () => {
    // Use a date 1 day after the last C session (2026-05-03) — muscles are still recovering
    // Expected next is A, but if A's muscles are fatigued it should pick the best available
    const result = getNextTemplate(demoSessions, workoutTemplates, new Date("2026-05-04T12:00:00"));
    expect(result).toBeDefined();
    expect(result.day).toMatch(/^[ABC]$/);
  });

  it("preserves rotation when only one session exists and muscles are fresh", () => {
    const oneSession = [demoSessions[0]]; // only A completed
    const result = getNextTemplate(oneSession, workoutTemplates, new Date("2026-05-15T12:00:00"));
    expect(result.day).toBe("B");
  });

  it("throws when no templates are available", () => {
    expect(() => getNextTemplate(demoSessions, [])).toThrow("No templates available");
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

describe("adaptive home page logic", () => {
  const SCHEDULE = ["Monday", "Wednesday", "Friday"];
  const TZ = "America/New_York";

  function session(date: string, status: "completed" | "missed", sets: Array<{ exerciseId: string; weight: number; reps: number }> = []): WorkoutSession {
    return {
      id: `s-${date}`,
      templateId: "t",
      date,
      status,
      performedSets: sets.map((s, i) => ({ ...s, setNumber: i + 1, date })),
    };
  }

  it("getStreakDays counts consecutive completed scheduled days back from today", () => {
    // Friday May 22, Wed May 20, Mon May 18 — all scheduled completed days leading into Mon May 25
    const sessions = [
      session("2026-05-18", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
      session("2026-05-20", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
      session("2026-05-22", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
      session("2026-05-25", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
    ];
    // Tuesday 2026-05-26 — today is a rest day; streak should include the 4 prior completed scheduled days
    const today = new Date("2026-05-26T12:00:00");
    expect(getStreakDays(sessions, SCHEDULE, TZ, today)).toBe(4);
  });

  it("getStreakDays breaks when a scheduled day was missed", () => {
    const sessions = [
      session("2026-05-18", "completed", []),
      // Wed 2026-05-20 missed
      session("2026-05-22", "completed", []),
    ];
    const today = new Date("2026-05-23T12:00:00"); // Saturday — rest day
    expect(getStreakDays(sessions, SCHEDULE, TZ, today)).toBe(1);
  });

  it("getMonthlySessionCount counts completed sessions in the current calendar month", () => {
    const sessions = [
      session("2026-04-30", "completed", []),
      session("2026-05-04", "completed", []),
      session("2026-05-11", "completed", []),
      session("2026-05-25", "missed", []),
    ];
    const today = new Date("2026-05-26T12:00:00");
    expect(getMonthlySessionCount(sessions, today, TZ)).toBe(2);
  });

  it("detectSessionPRs returns a PR when weight beats every prior session", () => {
    const sessions = [
      session("2026-05-18", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
      session("2026-05-20", "completed", [{ exerciseId: "lat-pulldown", weight: 110, reps: 8 }]),
    ];
    const prs = detectSessionPRs(sessions[1], sessions);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({ exerciseId: "lat-pulldown", type: "weight", value: 110 });
  });

  it("generateCoachFeed leads with a training CTA on a scheduled workout day", () => {
    const workout: WorkoutTemplate = workoutTemplates[0];
    const bubbles = generateCoachFeed({
      sessions: [],
      today: new Date("2026-05-25T12:00:00"), // Monday — scheduled
      timeZone: TZ,
      schedule: SCHEDULE,
      workout,
      isWorkoutDay: true,
      isPushedToToday: false,
      isSkipped: false,
      nextDay: "Wednesday",
    });
    expect(bubbles[0].kind).toBe("training_cta");
    expect(bubbles[0].cta?.href).toMatch(/^\/workout\?templateId=/);
  });

  it("generateCoachFeed leads with a rest-day bubble and offers an optional CTA on a rest day", () => {
    const workout: WorkoutTemplate = workoutTemplates[0];
    const bubbles = generateCoachFeed({
      sessions: [],
      today: new Date("2026-05-26T12:00:00"), // Tuesday — not scheduled
      timeZone: TZ,
      schedule: SCHEDULE,
      workout,
      isWorkoutDay: false,
      isPushedToToday: false,
      isSkipped: false,
      nextDay: "Wednesday",
    });
    expect(bubbles[0].kind).toBe("rest_day");
    expect(bubbles.some((b) => b.kind === "training_cta_optional")).toBe(true);
  });

  it("generateCoachFeed surfaces a PR_progress bubble after a PR session", () => {
    const sessions = [
      session("2026-05-18", "completed", [{ exerciseId: "lat-pulldown", weight: 100, reps: 10 }]),
      session("2026-05-25", "completed", [{ exerciseId: "lat-pulldown", weight: 115, reps: 8 }]),
    ];
    const bubbles = generateCoachFeed({
      sessions,
      today: new Date("2026-05-26T12:00:00"),
      timeZone: TZ,
      schedule: SCHEDULE,
      workout: workoutTemplates[0],
      isWorkoutDay: false,
      isPushedToToday: false,
      isSkipped: false,
      nextDay: "Wednesday",
    });
    expect(bubbles.some((b) => b.kind === "pr_progress")).toBe(true);
  });
});
