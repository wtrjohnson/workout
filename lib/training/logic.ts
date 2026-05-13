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

export function getTodayWorkout(date = new Date(), templates = workoutTemplates): WorkoutTemplate {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return templates[dayIndex % templates.length];
}

export function getNextTemplate(sessions: WorkoutSession[], templates: WorkoutTemplate[], today = new Date()): WorkoutTemplate {
  if (templates.length === 0) throw new Error("No templates available");

  const completed = sessions.filter((s) => s.status === "completed").length;
  const expectedIndex = completed % templates.length;

  const recovery = calculateRecovery(sessions, today);
  const recoveryByMuscle = new Map(recovery.map((r) => [r.muscleId, r.score]));

  function templateRecoveryScore(template: WorkoutTemplate): number {
    const muscleIds = new Set(
      template.exercises.flatMap((ex) => exerciseById.get(ex.exerciseId)?.primaryMuscles ?? [])
    );
    if (muscleIds.size === 0) return 100;
    let total = 0;
    for (const id of muscleIds) total += recoveryByMuscle.get(id) ?? 100;
    return total / muscleIds.size;
  }

  const expected = templates[expectedIndex];

  // Preserve the A→B→C rotation when muscles are sufficiently recovered
  const READY_THRESHOLD = 60;
  if (templateRecoveryScore(expected) >= READY_THRESHOLD) return expected;

  // Otherwise pick the template whose primary muscles are most recovered,
  // breaking ties by proximity to the expected rotation position
  return [...templates]
    .map((t, i) => ({
      template: t,
      score: templateRecoveryScore(t),
      distance: (i - expectedIndex + templates.length) % templates.length
    }))
    .sort((a, b) => b.score - a.score || a.distance - b.distance)[0].template;
}

export function isScheduledDay(date: Date, schedule: string[], timeZone?: string): boolean {
  if (schedule.length === 0) return true;
  const name = date.toLocaleDateString("en-US", { weekday: "long", ...(timeZone ? { timeZone } : {}) });
  return schedule.includes(name);
}

export function getNextScheduledDay(date: Date, schedule: string[], timeZone?: string): string {
  if (schedule.length === 0) return "tomorrow";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = date.toLocaleDateString("en-US", { weekday: "long", ...(timeZone ? { timeZone } : {}) });
  const todayIdx = days.indexOf(todayName);
  for (let offset = 1; offset <= 7; offset++) {
    const candidate = days[(todayIdx + offset) % 7];
    if (schedule.includes(candidate)) return candidate;
  }
  return schedule[0];
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

export function getRestSeconds(planned: PlannedExercise, loggedReps?: number): number {
  const exercise = getExercise(planned.exerciseId);
  const isCore = exercise.movementPattern.startsWith("core_");
  const isCompound = exercise.movementPattern !== "isolation" && !isCore;

  let base: number;
  if (isCore) base = 60;
  else if (planned.intensity === "hard" && isCompound) base = 120;
  else base = 75;

  if (loggedReps === undefined) return base;
  if (loggedReps >= planned.repRange[1]) return Math.max(45, base - 15);
  if (loggedReps < planned.repRange[0]) return base + 30;
  return base;
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

export type SetFeedback = {
  message: string;
  tone: "positive" | "neutral" | "caution";
};

export function getSetFeedback(
  loggedReps: number,
  planned: PlannedExercise,
  sessionExerciseSets: Array<{ reps: number }>,
  priorSets: PerformedSet[]
): SetFeedback {
  const [low, high] = planned.repRange;
  const prevSessionReps = sessionExerciseSets[sessionExerciseSets.length - 1]?.reps;
  const bestPrior = priorSets.length
    ? Math.max(...priorSets.map((s) => s.weight * s.reps))
    : null;

  if (prevSessionReps !== undefined && loggedReps <= prevSessionReps - 2) {
    return { message: "Notable drop from last set — take the full rest.", tone: "caution" };
  }
  if (loggedReps < low) {
    return { message: "Short of target. Hold this weight and rebuild the range.", tone: "caution" };
  }
  if (loggedReps > high && sessionExerciseSets.length === 0) {
    return { message: "Above target — consider adding weight next set.", tone: "positive" };
  }
  if (bestPrior !== null) {
    const currentBest = priorSets.length ? Math.max(...priorSets.map((s) => s.weight * s.reps)) : 0;
    if (currentBest > bestPrior * 1.05) {
      return { message: "New best volume. Earn the full range before jumping weight.", tone: "positive" };
    }
  }
  if (loggedReps >= high) {
    return { message: "Top of range — match or better next set.", tone: "positive" };
  }
  return { message: "On track. Match or beat next set.", tone: "neutral" };
}

export type SessionScore = {
  score: number;
  context: string;
};

export function scoreSession(
  loggedSets: Array<{ exerciseId: string; weight: number | null; reps: number }>,
  workout: WorkoutTemplate,
  sessions: WorkoutSession[]
): SessionScore {
  const plannedSets = workout.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const completionPts = Math.min(40, Math.round((loggedSets.length / plannedSets) * 40));

  const repQualityPts = Math.round(
    (loggedSets.reduce((sum, logged) => {
      const planned = workout.exercises.find((ex) => ex.exerciseId === logged.exerciseId);
      if (!planned) return sum + 1;
      const [low, high] = planned.repRange;
      if (logged.reps >= low) return sum + 1;
      return sum + 0.5;
    }, 0) /
      Math.max(1, loggedSets.length)) *
      40
  );

  const priorSame = [...sessions]
    .filter((s) => s.status === "completed" && s.templateId === workout.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const currentVolume = loggedSets.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0);
  const priorVolume = priorSame ? calculateSetVolume(priorSame.performedSets) : null;

  let volumePts = 10;
  let comparison = "";
  if (priorVolume !== null && priorVolume > 0) {
    const pct = ((currentVolume - priorVolume) / priorVolume) * 100;
    if (pct > 2) { volumePts = 20; comparison = "best session yet"; }
    else if (pct >= -2) { volumePts = 10; comparison = "matched last time"; }
    else { volumePts = 0; comparison = "down from last time"; }
  }

  const score = Math.min(100, completionPts + repQualityPts + volumePts);
  const context = comparison
    ? `${score >= 80 ? "Strong" : score >= 65 ? "Solid" : "Decent"} work — ${comparison}.`
    : "First session logged. Baseline set.";

  return { score, context };
}

export function detectPlateau(exerciseId: string, sessions: WorkoutSession[], threshold = 3): string | null {
  const relevant = [...sessions]
    .filter((s) => s.status === "completed" && s.performedSets.some((p) => p.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, threshold);

  if (relevant.length < threshold) return null;

  const volumes = relevant.map((s) =>
    calculateSetVolume(s.performedSets.filter((p) => p.exerciseId === exerciseId))
  );

  const improved = volumes.slice(0, -1).some((v, i) => v > volumes[i + 1]);
  return improved ? null : getExercise(exerciseId).name;
}

export function detectProgressStreak(exerciseId: string, sessions: WorkoutSession[], threshold = 2): { exerciseName: string; count: number } | null {
  const relevant = [...sessions]
    .filter((s) => s.status === "completed" && s.performedSets.some((p) => p.exerciseId === exerciseId))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (relevant.length < threshold + 1) return null;

  const volumes = relevant.map((s) =>
    calculateSetVolume(s.performedSets.filter((p) => p.exerciseId === exerciseId))
  );

  let streak = 0;
  for (let i = 0; i < volumes.length - 1; i++) {
    if (volumes[i] > volumes[i + 1]) streak++;
    else break;
  }

  return streak >= threshold ? { exerciseName: getExercise(exerciseId).name, count: streak } : null;
}

export function generateInsights(sessions: WorkoutSession[], today = new Date()): Insight[] {
  const volume = calculateWeeklyMuscleVolume(sessions, today);
  const weekly = getWeeklySummary(sessions, today);
  const completedThisWeek = weekly.completedSessions;
  const insights: Insight[] = [];

  // Plateau detection — check exercises from most recent session
  const recentSession = [...sessions]
    .filter((s) => s.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (recentSession) {
    const exerciseIds = [...new Set(recentSession.performedSets.map((s) => s.exerciseId))];
    for (const id of exerciseIds) {
      const plateau = detectPlateau(id, sessions);
      if (plateau) {
        insights.push({
          id: `plateau-${id}`,
          type: "plateau",
          tone: "tough_love",
          title: "Plateau detected",
          message: `${plateau} hasn't moved in 3 sessions. Try a drop set, change the rep range, or add a set.`
        });
        break;
      }
    }
    for (const id of exerciseIds) {
      const streak = detectProgressStreak(id, sessions);
      if (streak) {
        insights.push({
          id: `streak-${id}`,
          type: "streak",
          tone: "encouraging",
          title: "Progression streak",
          message: `${streak.exerciseName} is up ${streak.count} sessions running. Don't change what's working.`
        });
        break;
      }
    }
  }

  // Deload signal
  if (weekly.volumeChangePercent !== null && weekly.volumeChangePercent > 20) {
    insights.push({
      id: "deload-signal",
      type: "deload",
      tone: "tough_love",
      title: "Volume spike",
      message: `Weekly volume is up ${weekly.volumeChangePercent}% over last week. Consider a lighter session before recovery starts limiting gains.`
    });
  }

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

  return insights.slice(0, 6);
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
