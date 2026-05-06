import { exercises, muscles, workoutTemplates } from "./data";
import type {
  Exercise,
  Insight,
  MuscleId,
  MuscleRecovery,
  MuscleVolume,
  PerformedSet,
  PlannedExercise,
  RecoveryStatus,
  VolumeStatus,
  WorkoutSession,
  WorkoutTemplate
} from "./types";

const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

export function getTodayWorkout(date = new Date()): WorkoutTemplate {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return workoutTemplates[dayIndex % workoutTemplates.length];
}

export function getExercise(id: string): Exercise {
  const exercise = exerciseById.get(id);
  if (!exercise) {
    throw new Error(`Unknown exercise: ${id}`);
  }
  return exercise;
}

export function getLastSets(exerciseId: string, sessions: WorkoutSession[]): PerformedSet[] {
  return sessions
    .flatMap((session) => session.performedSets)
    .filter((set) => set.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date) || a.setNumber - b.setNumber)
    .slice(0, 3)
    .sort((a, b) => a.setNumber - b.setNumber);
}

export function suggestProgression(planned: PlannedExercise, sessions: WorkoutSession[]): string {
  const lastSets = getLastSets(planned.exerciseId, sessions);
  if (lastSets.length === 0) {
    return "Start conservative and leave 1-3 reps in reserve.";
  }

  const topRepTarget = planned.repRange[1];
  const allTopRange = lastSets.length >= planned.targetSets && lastSets.every((set) => set.reps >= topRepTarget);
  const anyBelowRange = lastSets.some((set) => set.reps < planned.repRange[0]);
  const lastWeight = lastSets[0]?.weight ?? 0;

  if (allTopRange) {
    const jump = lastWeight < 50 ? 5 : 10;
    return `Add ${jump} lb if form stays clean. Last time you owned the top of the range.`;
  }

  if (anyBelowRange) {
    return "Repeat the load or trim 5-10 lb. Earn the low end before chasing weight.";
  }

  return "Repeat the same load and add reps before increasing weight.";
}

export type WorkoutStep = {
  stepIndex: number;
  exerciseIndex: number;
  setIndex: number;
  planned: PlannedExercise;
};

export type SuggestedSet = {
  weight: number | null;
  reps: number;
  reason: string;
};

export type ExerciseStats = {
  exerciseId: string;
  sessionsLogged: number;
  totalSets: number;
  lastSets: PerformedSet[];
  bestSet: PerformedSet | null;
  latestVolume: number;
  previousVolume: number | null;
  volumeChangePercent: number | null;
};

export type WeeklySummary = {
  completedSessions: number;
  completedSets: number;
  totalVolume: number;
  priorWeekVolume: number;
  volumeChangePercent: number | null;
  dailySetCounts: number[];
};

export function buildWorkoutSteps(workout: WorkoutTemplate): WorkoutStep[] {
  return workout.exercises.flatMap((planned, exerciseIndex) =>
    Array.from({ length: planned.targetSets }, (_, setIndex) => ({
      stepIndex: workout.exercises.slice(0, exerciseIndex).reduce((sum, exercise) => sum + exercise.targetSets, 0) + setIndex,
      exerciseIndex,
      setIndex,
      planned
    }))
  );
}

export function getSuggestedSet(planned: PlannedExercise, setIndex: number, sessions: WorkoutSession[]): SuggestedSet {
  const lastSets = getLastSets(planned.exerciseId, sessions);
  const matchingSet = lastSets[setIndex] ?? lastSets[lastSets.length - 1];

  if (!matchingSet) {
    return {
      weight: null,
      reps: planned.repRange[1],
      reason: "No history yet. Hit the target reps with a clean, conservative load."
    };
  }

  const topRepTarget = planned.repRange[1];
  const allTopRange = lastSets.length >= planned.targetSets && lastSets.every((set) => set.reps >= topRepTarget);
  const anyBelowRange = lastSets.some((set) => set.reps < planned.repRange[0]);

  if (allTopRange) {
    const jump = matchingSet.weight < 50 ? 5 : 10;
    return {
      weight: matchingSet.weight + jump,
      reps: planned.repRange[0],
      reason: `Increase from last time. Start at ${planned.repRange[0]} reps and earn the range again.`
    };
  }

  if (anyBelowRange) {
    return {
      weight: matchingSet.weight,
      reps: Math.max(planned.repRange[0], matchingSet.reps),
      reason: "Repeat the load. Own the low end before adding weight."
    };
  }

  return {
    weight: matchingSet.weight,
    reps: Math.min(topRepTarget, matchingSet.reps + 1),
    reason: "Add a rep before increasing weight."
  };
}

export function getRestSeconds(planned: PlannedExercise): number {
  const exercise = getExercise(planned.exerciseId);
  const isCore = exercise.movementPattern.startsWith("core_");
  const isCompound = exercise.movementPattern !== "isolation" && !isCore;

  if (isCore) return 60;
  if (planned.intensity === "hard" && isCompound) return 120;
  return 75;
}

export function getExerciseStats(exerciseId: string, sessions: WorkoutSession[]): ExerciseStats {
  const matchingSessions = [...sessions]
    .filter((session) => session.status === "completed" && session.performedSets.some((set) => set.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastSets = matchingSessions[0]?.performedSets.filter((set) => set.exerciseId === exerciseId) ?? [];
  const previousSets = matchingSessions[1]?.performedSets.filter((set) => set.exerciseId === exerciseId) ?? [];
  const allSets = matchingSessions.flatMap((session) => session.performedSets.filter((set) => set.exerciseId === exerciseId));
  const bestSet = allSets.length
    ? [...allSets].sort((a, b) => b.weight * b.reps - a.weight * a.reps)[0]
    : null;
  const latestVolume = calculateSetVolume(lastSets);
  const previousVolume = previousSets.length ? calculateSetVolume(previousSets) : null;

  return {
    exerciseId,
    sessionsLogged: matchingSessions.length,
    totalSets: allSets.length,
    lastSets,
    bestSet,
    latestVolume,
    previousVolume,
    volumeChangePercent:
      previousVolume && previousVolume > 0 ? Math.round(((latestVolume - previousVolume) / previousVolume) * 100) : null
  };
}

export function getWeeklySummary(sessions: WorkoutSession[], today = new Date()): WeeklySummary {
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const priorWeekStart = new Date(weekStart);
  priorWeekStart.setDate(weekStart.getDate() - 7);

  const currentWeek = sessions.filter((session) => {
    const date = new Date(session.date);
    return session.status === "completed" && date >= weekStart && date <= today;
  });
  const priorWeek = sessions.filter((session) => {
    const date = new Date(session.date);
    return session.status === "completed" && date >= priorWeekStart && date < weekStart;
  });
  const totalVolume = calculateSetVolume(currentWeek.flatMap((session) => session.performedSets));
  const priorWeekVolume = calculateSetVolume(priorWeek.flatMap((session) => session.performedSets));
  const dailySetCounts = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return currentWeek
      .filter((session) => new Date(session.date).toDateString() === day.toDateString())
      .reduce((sum, session) => sum + session.performedSets.length, 0);
  });

  return {
    completedSessions: currentWeek.length,
    completedSets: currentWeek.reduce((sum, session) => sum + session.performedSets.length, 0),
    totalVolume,
    priorWeekVolume,
    volumeChangePercent:
      priorWeekVolume > 0 ? Math.round(((totalVolume - priorWeekVolume) / priorWeekVolume) * 100) : null,
    dailySetCounts
  };
}

export function findSubstitutions(exerciseId: string, painFlags: string[] = []): Exercise[] {
  const original = getExercise(exerciseId);
  return exercises
    .filter((candidate) => candidate.id !== exerciseId)
    .filter((candidate) => candidate.planetFitnessReady)
    .filter((candidate) => candidate.movementPattern === original.movementPattern || sharesPrimaryMuscle(candidate, original))
    .filter((candidate) => !candidate.jointStress?.some((stress) => painFlags.includes(stress)))
    .sort((a, b) => substitutionScore(b, original) - substitutionScore(a, original))
    .slice(0, 4);
}

export function calculateWeeklyMuscleVolume(sessions: WorkoutSession[], today = new Date()): MuscleVolume[] {
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const volume = new Map<MuscleId, number>();
  sessions
    .filter((session) => session.status === "completed" && new Date(session.date) >= weekAgo)
    .flatMap((session) => session.performedSets)
    .forEach((set) => {
      const exercise = getExercise(set.exerciseId);
      exercise.primaryMuscles.forEach((muscleId) => volume.set(muscleId, (volume.get(muscleId) ?? 0) + 1));
      exercise.secondaryMuscles.forEach((muscleId) => volume.set(muscleId, (volume.get(muscleId) ?? 0) + 0.5));
    });

  return muscles.map((muscle) => {
    const sets = Number((volume.get(muscle.id) ?? 0).toFixed(1));
    return { muscleId: muscle.id, sets, status: getVolumeStatus(sets) };
  });
}

export function calculateRecovery(sessions: WorkoutSession[], today = new Date()): MuscleRecovery[] {
  return muscles.map((muscle) => {
    const relevantSets = sessions
      .filter((session) => session.status === "completed")
      .flatMap((session) => session.performedSets)
      .filter((set) => {
        const exercise = getExercise(set.exerciseId);
        return exercise.primaryMuscles.includes(muscle.id) || exercise.secondaryMuscles.includes(muscle.id);
      });

    if (relevantSets.length === 0) {
      return { muscleId: muscle.id, status: "fresh", score: 100, lastTrainedDaysAgo: null };
    }

    const newest = relevantSets.sort((a, b) => b.date.localeCompare(a.date))[0];
    const daysAgo = Math.max(0, Math.floor((today.getTime() - new Date(newest.date).getTime()) / 86_400_000));
    const recentLoad = relevantSets.filter((set) => {
      const age = Math.floor((today.getTime() - new Date(set.date).getTime()) / 86_400_000);
      return age <= 4;
    }).length;
    const score = Math.max(0, Math.min(100, 100 - recentLoad * 8 - Math.max(0, 2 - daysAgo) * 10));
    return { muscleId: muscle.id, status: recoveryLabel(score), score, lastTrainedDaysAgo: daysAgo };
  });
}

export function generateInsights(sessions: WorkoutSession[], today = new Date()): Insight[] {
  const volume = calculateWeeklyMuscleVolume(sessions, today);
  const completedThisWeek = sessions.filter((session) => {
    const age = Math.floor((today.getTime() - new Date(session.date).getTime()) / 86_400_000);
    return session.status === "completed" && age <= 7;
  }).length;
  const insights: Insight[] = [];

  const underTarget = volume.filter((item) => item.status === "under_target" && ["chest", "lats", "quads", "hamstrings", "glutes"].includes(item.muscleId));
  if (underTarget.length > 0) {
    insights.push({
      id: "balance-under-target",
      type: "balance",
      tone: "data",
      title: "Muscle coverage gap",
      message: `${labelMuscles(underTarget.map((item) => item.muscleId))} are under the weekly hypertrophy target. Add them before piling on extra arm work.`
    });
  }

  const highVolume = volume.find((item) => item.status === "overreaching");
  if (highVolume) {
    insights.push({
      id: "recovery-high-volume",
      type: "recovery",
      tone: "tough_love",
      title: "Volume is loud",
      message: `${labelMuscles([highVolume.muscleId])} volume is very high this week. More is only better while performance is still moving.`
    });
  }

  if (completedThisWeek >= 3) {
    insights.push({
      id: "consistency-3",
      type: "consistency",
      tone: "encouraging",
      title: "Three sessions banked",
      message: "That is the weekly structure doing its job. Keep the next session boring, clean, and logged."
    });
  }

  const improvedLift = findImprovedLift(sessions);
  if (improvedLift) {
    insights.push({
      id: "progress-lift",
      type: "progress",
      tone: "data",
      title: "Progression signal",
      message: `${getExercise(improvedLift).name} moved up versus the prior session. That is progressive overload, not motivational confetti.`
    });
  }

  return insights.slice(0, 4);
}

function sharesPrimaryMuscle(candidate: Exercise, original: Exercise): boolean {
  return candidate.primaryMuscles.some((muscle) => original.primaryMuscles.includes(muscle));
}

function substitutionScore(candidate: Exercise, original: Exercise): number {
  let score = 0;
  if (candidate.movementPattern === original.movementPattern) score += 4;
  score += candidate.primaryMuscles.filter((muscle) => original.primaryMuscles.includes(muscle)).length * 3;
  score += candidate.secondaryMuscles.filter((muscle) => original.secondaryMuscles.includes(muscle)).length;
  if (original.alternatives.includes(candidate.id)) score += 3;
  if (candidate.equipment.some((equipment) => original.equipment.includes(equipment))) score += 1;
  return score;
}

function getVolumeStatus(sets: number): VolumeStatus {
  if (sets < 6) return "under_target";
  if (sets <= 14) return "on_track";
  if (sets <= 20) return "high";
  return "overreaching";
}

function recoveryLabel(score: number): RecoveryStatus {
  if (score >= 80) return "fresh";
  if (score >= 60) return "ready";
  if (score >= 35) return "fatigued";
  return "very_fatigued";
}

function labelMuscles(ids: MuscleId[]): string {
  return ids
    .map((id) => muscles.find((muscle) => muscle.id === id)?.name ?? id)
    .join(", ");
}

function findImprovedLift(sessions: WorkoutSession[]): string | null {
  const completed = [...sessions].filter((session) => session.status === "completed").sort((a, b) => b.date.localeCompare(a.date));
  const latestExerciseIds = new Set(completed[0]?.performedSets.map((set) => set.exerciseId) ?? []);

  for (const exerciseId of latestExerciseIds) {
    const sessionSets = completed
      .map((session) => session.performedSets.filter((set) => set.exerciseId === exerciseId))
      .filter((sets) => sets.length > 0);

    if (sessionSets.length < 2) continue;

    const [latest, previous] = sessionSets;
    const latestTotal = latest.reduce((sum, set) => sum + set.weight * set.reps, 0);
    const previousTotal = previous.reduce((sum, set) => sum + set.weight * set.reps, 0);
    if (latestTotal > previousTotal) return exerciseId;
  }

  return null;
}

function calculateSetVolume(sets: PerformedSet[]): number {
  return sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
}
