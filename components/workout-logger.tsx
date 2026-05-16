"use client";

import { Clock, Repeat2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SelectableChip } from "@/components/selectable-chip";
import {
  buildWorkoutSteps,
  detectNewPRs,
  findSubstitutions,
  getExerciseStats,
  getExercise,
  getRestSeconds,
  getSetFeedback,
  getSuggestedSet,
  scoreSession
} from "@/lib/training/logic";
import type { PersonalRecord, WorkoutStep } from "@/lib/training/logic";
import type { PerceivedEffort, WorkoutSession, WorkoutTemplate } from "@/lib/training/types";

type LoggedSet = {
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  durationSeconds?: number;
};

type MutableStep = WorkoutStep & { skippedOnce: boolean };

type WorkoutMode = "active" | "resting" | "complete";
type ActivePanel = "history" | "info" | null;

const painOptions = ["shoulder", "knee", "lower_back"] as const;

const EFFORT_OPTIONS: Array<{ value: PerceivedEffort; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "comfortable", label: "Comfortable" },
  { value: "moderate", label: "Just right" },
  { value: "hard", label: "Hard" },
  { value: "very_hard", label: "Wrecked" }
];

export function WorkoutLogger({ workout, sessions }: { workout: WorkoutTemplate; sessions: WorkoutSession[] }) {
  const [steps, setSteps] = useState<MutableStep[]>(() =>
    buildWorkoutSteps(workout).map((step) => ({ ...step, skippedOnce: false }))
  );
  const [mode, setMode] = useState<WorkoutMode>("active");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [painFlags, setPainFlags] = useState<string[]>([]);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [setFeedback, setSetFeedback] = useState<import("@/lib/training/logic").SetFeedback | null>(null);

  // Rest timer: anchored to wall clock so backgrounding doesn't lose time
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(0);
  const [remainingRest, setRemainingRest] = useState(0);

  if (steps.length === 0) {
    return (
      <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-card">
        <p className="text-sm font-medium text-label">Empty template</p>
        <h1 className="chunky-title mt-1 text-3xl font-black leading-none text-ink">No exercises</h1>
        <p className="mono-copy mt-3 text-xs leading-5 text-label">This workout template has no exercises configured.</p>
      </div>
    );
  }

  const activeStep = steps[activeStepIndex];
  const currentExerciseId = swaps[activeStep.planned.exerciseId] ?? activeStep.planned.exerciseId;
  const currentPlanned = { ...activeStep.planned, exerciseId: currentExerciseId };
  const currentExercise = getExercise(currentExerciseId);
  const isTimeBased = currentExercise.isTimeBased ?? false;
  const suggested = getSuggestedSet(currentPlanned, activeStep.setIndex, sessions);
  const [weight, setWeight] = useState<number | null>(suggested.weight);
  const [reps, setReps] = useState(suggested.reps);
  const [duration, setDuration] = useState(() => {
    if (!isTimeBased) return 30;
    const prev = sessions
      .flatMap((s) => s.performedSets)
      .filter((s) => s.exerciseId === currentExerciseId && s.durationSeconds)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    return prev?.durationSeconds ?? 30;
  });

  const substitutions = findSubstitutions(currentExerciseId, painFlags);
  const exerciseStats = getExerciseStats(currentExerciseId, sessions);
  const nextStep = steps[activeStepIndex + 1];
  const progress = Math.round((loggedSets.length / steps.length) * 100);

  useEffect(() => {
    const nextSuggestion = getSuggestedSet(currentPlanned, activeStep.setIndex, sessions);
    setWeight(nextSuggestion.weight);
    setReps(nextSuggestion.reps);
    if (currentExercise.isTimeBased) {
      const prev = sessions
        .flatMap((s) => s.performedSets)
        .filter((s) => s.exerciseId === currentExerciseId && s.durationSeconds)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      setDuration(prev?.durationSeconds ?? 30);
    }
  }, [activeStep.setIndex, currentExerciseId]);

  function startRest(seconds: number, nextExerciseName?: string) {
    const dur = Math.max(1, seconds);
    setRestDuration(dur);
    setRemainingRest(dur);
    setRestEndTime(Date.now() + dur * 1000);

    // Ask service worker to schedule a notification for when rest ends
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((sw) => {
        sw.active?.postMessage({ type: "SCHEDULE_REST_NOTIFICATION", seconds: dur, nextExercise: nextExerciseName });
      }).catch(() => null);
    }
  }

  function goToNextStep() {
    setRestEndTime(null);
    if (activeStepIndex >= steps.length - 1) {
      setMode("complete");
      return;
    }
    setActiveStepIndex((current) => current + 1);
    setMode("active");
  }

  // Anchored interval: recalculates from wall clock on each tick
  useEffect(() => {
    if (mode !== "resting" || restEndTime === null) return;

    function tick() {
      const remaining = Math.max(0, Math.round((restEndTime! - Date.now()) / 1000));
      setRemainingRest(remaining);
      if (remaining <= 0) goToNextStep();
    }

    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [mode, restEndTime]);

  // Sync timer when app returns from background
  useEffect(() => {
    if (mode !== "resting" || restEndTime === null) return;

    function onVisible() {
      if (document.visibilityState === "visible") {
        const remaining = Math.max(0, Math.round((restEndTime! - Date.now()) / 1000));
        setRemainingRest(remaining);
        if (remaining <= 0) goToNextStep();
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [mode, restEndTime]);

  function completeSet() {
    const completedSet: LoggedSet = isTimeBased
      ? { exerciseId: currentExerciseId, setNumber: activeStep.setIndex + 1, weight: 0, reps: 0, durationSeconds: duration }
      : { exerciseId: currentExerciseId, setNumber: activeStep.setIndex + 1, weight, reps };

    if (!isTimeBased) {
      const sessionExerciseSets = loggedSets
        .filter((s) => s.exerciseId === currentExerciseId)
        .map((s) => ({ reps: s.reps, weight: s.weight ?? 0 }));
      const priorSets = sessions
        .flatMap((s) => s.performedSets)
        .filter((s) => s.exerciseId === currentExerciseId);
      setSetFeedback(getSetFeedback(reps, currentPlanned, sessionExerciseSets, priorSets));
    } else {
      setSetFeedback(null);
    }

    setLoggedSets((current) => [...current, completedSet]);

    if (activeStepIndex >= steps.length - 1) {
      setMode("complete");
      return;
    }

    const nextExName = nextStep ? getExercise(swaps[nextStep.planned.exerciseId] ?? nextStep.planned.exerciseId).name : undefined;
    startRest(getRestSeconds(currentPlanned, isTimeBased ? undefined : reps), nextExName);
    setMode("resting");
  }

  function skipExercise() {
    const exId = activeStep.planned.exerciseId;
    setSteps((current) => {
      const toDefer = current
        .slice(activeStepIndex)
        .filter((s) => s.planned.exerciseId === exId && !s.skippedOnce)
        .map((s) => ({ ...s, skippedOnce: true }));
      const remaining = current
        .slice(activeStepIndex)
        .filter((s) => s.planned.exerciseId !== exId || s.skippedOnce);
      return [...current.slice(0, activeStepIndex), ...remaining, ...toDefer];
    });
    // activeStepIndex stays the same — next exercise now slides into that position
  }

  function togglePain(flag: string) {
    setPainFlags((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));
  }

  function swapExercise(nextExerciseId: string) {
    setSwaps((current) => ({ ...current, [activeStep.planned.exerciseId]: nextExerciseId }));
    setActivePanel(null);
  }

  if (mode === "complete") {
    return (
      <WorkoutScorecard
        loggedSets={loggedSets}
        totalSets={steps.length}
        workout={workout}
        sessions={sessions}
        painFlags={painFlags}
        swaps={swaps}
      />
    );
  }

  if (mode === "resting") {
    return (
      <RestScreen
        remainingRest={remainingRest}
        restDuration={restDuration}
        nextLabel={nextStep ? getExercise(swaps[nextStep.planned.exerciseId] ?? nextStep.planned.exerciseId).name : "Scorecard"}
        nextSet={nextStep ? nextStep.setIndex + 1 : null}
        feedback={setFeedback}
        onAddTime={() => {
          setRestDuration((d) => d + 30);
          setRemainingRest((r) => r + 30);
          setRestEndTime((t) => (t ?? Date.now()) + 30_000);
        }}
        onRemoveTime={() => {
          setRestDuration((d) => Math.max(1, d - 30));
          setRemainingRest((r) => Math.max(0, r - 30));
          setRestEndTime((t) => (t ?? Date.now()) - 30_000);
        }}
        onSkip={goToNextStep}
      />
    );
  }

  return (
    <>
      <ProgressStrip
        completedSets={loggedSets.length}
        totalSets={steps.length}
        exerciseIndex={activeStep.exerciseIndex + 1}
        totalExercises={workout.exercises.length}
        progress={progress}
      />

      <section className="py-2">
        <button
          className="text-left"
          onClick={() => setActivePanel("info")}
          type="button"
          aria-label="View form cues"
        >
          <h2 className="chunky-title text-5xl font-black leading-none text-ink underline decoration-[#2563eb] decoration-2 underline-offset-4">
            {shortExerciseName(currentExercise.name)}
          </h2>
        </button>
        <p className="mono-copy mt-3 text-sm text-label">
          Set {activeStep.setIndex + 1} of {activeStep.planned.targetSets}
        </p>
      </section>

      <section className="rounded-3xl bg-[#2563eb] px-5 py-7">
        {isTimeBased ? (
          <div className="flex justify-center">
            <StepperValue
              label="Duration"
              value={duration}
              unit="sec"
              step={5}
              min={5}
              onChange={(value) => setDuration(value ?? 5)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StepperValue
              label="Weight"
              value={weight}
              unit="lbs"
              step={5}
              min={0}
              onChange={setWeight}
            />
            <StepperValue label="Reps" value={reps} unit="reps" step={1} min={1} onChange={(value) => setReps(value ?? 1)} />
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          className="tap-target flex-1 rounded-3xl bg-ink px-5 py-4 text-3xl font-black leading-none text-white shadow-card"
          onClick={completeSet}
          type="button"
        >
          Log set
        </button>
        {!activeStep.skippedOnce && (
          <button
            className="tap-target rounded-3xl border border-black/8 bg-white px-4 py-4 text-sm font-black leading-none text-ink shadow-card"
            onClick={skipExercise}
            type="button"
          >
            Skip
          </button>
        )}
        <button
          className="grid size-16 place-items-center rounded-full border border-black/8 bg-white text-ink shadow-card"
          onClick={() => setActivePanel("history")}
          type="button"
          aria-label="Exercise history"
        >
          <Clock className="size-6" aria-hidden />
        </button>
      </div>

      {activePanel ? (
        <PanelOverlay title={activePanel === "history" ? "Exercise history" : "Exercise info"} onClose={() => setActivePanel(null)}>
          {activePanel === "history" ? (
            <ExerciseStatsPanel stats={exerciseStats} suggestion={suggested.reason} isTimeBased={isTimeBased} />
          ) : (
            <ExerciseInfoPanel
              cues={currentExercise.techniqueCues}
              substitutions={substitutions}
              painFlags={painFlags}
              onPainToggle={togglePain}
              onSwap={swapExercise}
            />
          )}
        </PanelOverlay>
      ) : null}
    </>
  );
}

function ProgressStrip({
  completedSets,
  totalSets,
  exerciseIndex,
  totalExercises,
  progress
}: {
  completedSets: number;
  totalSets: number;
  exerciseIndex: number;
  totalExercises: number;
  progress: number;
}) {
  return (
    <section className="rounded-2xl">
      <div className="flex items-center justify-between text-xs font-semibold text-label">
        <span>{completedSets} / {totalSets} sets</span>
        <span>Exercise {exerciseIndex} / {totalExercises}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/8">
        <div className="h-full rounded-full bg-[#2563eb] transition-all" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function StepperValue({
  label,
  value,
  unit,
  step,
  min,
  onChange
}: {
  label: string;
  value: number | null;
  unit: string;
  step: number;
  min: number;
  onChange: (value: number | null) => void;
}) {
  const displayValue = value ?? 0;

  function adjust(delta: number) {
    onChange(Math.max(min, displayValue + delta));
  }

  return (
    <div className="text-center">
      <button className="mx-auto grid size-10 place-items-center text-white/60" onClick={() => adjust(step)} type="button" aria-label={`Increase ${label}`}>
        <Triangle direction="up" />
      </button>
      <div className="flex items-baseline justify-center">
        <label className="min-w-0">
          <span className="sr-only">{label}</span>
          <input
            className="w-20 bg-transparent text-center text-5xl font-black leading-none text-white outline-none"
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
            value={value ?? ""}
          />
        </label>
        <span className="chunky-title -ml-1 text-5xl font-black leading-none text-white/60">{unit}</span>
      </div>
      <button className="mx-auto grid size-10 place-items-center text-white/60" onClick={() => adjust(-step)} type="button" aria-label={`Decrease ${label}`}>
        <Triangle direction="down" />
      </button>
    </div>
  );
}

function Triangle({ direction }: { direction: "up" | "down" }) {
  return (
    <span
      className={`block h-0 w-0 border-x-[30px] border-x-transparent ${
        direction === "up" ? "border-b-[24px] border-b-current" : "border-t-[24px] border-t-current"
      }`}
    />
  );
}

function RestScreen({
  remainingRest,
  restDuration,
  nextLabel,
  nextSet,
  feedback,
  onAddTime,
  onRemoveTime,
  onSkip
}: {
  remainingRest: number;
  restDuration: number;
  nextLabel: string;
  nextSet: number | null;
  feedback: import("@/lib/training/logic").SetFeedback | null;
  onAddTime: () => void;
  onRemoveTime: () => void;
  onSkip: () => void;
}) {
  const progress = restDuration > 0 ? Math.max(0, Math.min(100, Math.round((remainingRest / restDuration) * 100))) : 0;
  const feedbackColor =
    feedback?.tone === "positive" ? "text-[#16a34a]" :
    feedback?.tone === "caution" ? "text-[#d97706]" :
    "text-label";

  return (
    <section className="flex min-h-[72vh] flex-1 flex-col px-1 py-3">
      <h2 className="chunky-title text-5xl font-black leading-none text-ink">Rest</h2>
      <div className="relative mx-auto mt-12 grid size-64 place-items-center rounded-full">
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="#2563eb"
            strokeDasharray="270"
            strokeDashoffset={270 - 270 * (progress / 100)}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <p className="mono-copy text-5xl leading-none text-ink">{formatSeconds(remainingRest)}</p>
      </div>
      {feedback && (
        <p className={`mono-copy mt-4 text-center text-sm ${feedbackColor}`}>{feedback.message}</p>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <button className="tap-target rounded-3xl border border-black/8 bg-white px-4 py-3 text-lg font-black leading-none text-ink shadow-card" onClick={onRemoveTime} type="button">
          −30
        </button>
        <button className="tap-target rounded-3xl border border-black/8 bg-white px-4 py-3 text-lg font-black leading-none text-ink shadow-card" onClick={onAddTime} type="button">
          +30
        </button>
        <button className="tap-target rounded-3xl bg-ink px-4 py-3 text-lg font-black leading-none text-white shadow-card" onClick={onSkip} type="button">
          skip
        </button>
      </div>
      <div className="mt-auto flex items-baseline gap-4 pb-2">
        <p className="chunky-title text-5xl font-black leading-none text-ink">Up next</p>
        <p className="text-5xl font-light leading-none text-label">
          {nextSet ? `set ${nextSet}` : "done"}
        </p>
      </div>
      <p className="mono-copy -mt-1 truncate text-sm text-label">{nextLabel}</p>
    </section>
  );
}

function ExerciseStatsPanel({
  stats,
  suggestion,
  isTimeBased
}: {
  stats: ReturnType<typeof getExerciseStats>;
  suggestion: string;
  isTimeBased: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">Exercise history</p>
      {!isTimeBased && (
        <div className="mt-3 rounded-2xl border border-black/6 bg-surface p-3">
          <p className="mono-copy text-xs text-label">Suggestion</p>
          <p className="mono-copy mt-1 text-sm leading-6 text-ink">{suggestion}</p>
        </div>
      )}
      {stats.lastSets.length > 0 ? (
        <>
          <div className="mt-3 rounded-2xl border border-black/6 bg-surface p-3">
            <p className="mono-copy text-xs text-label">Last time</p>
            <p className="mono-copy mt-1 text-sm leading-6 text-ink">
              {stats.lastSets.map((set) =>
                isTimeBased && set.durationSeconds != null
                  ? `${set.durationSeconds}s`
                  : `${set.weight} x ${set.reps}`
              ).join(", ")}
            </p>
          </div>
          {!isTimeBased && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <StatTile label="Best set" value={stats.bestSet ? `${stats.bestSet.weight} x ${stats.bestSet.reps}` : "N/A"} />
              <StatTile
                label="Volume"
                value={
                  stats.volumeChangePercent === null
                    ? `${Math.round(stats.latestVolume).toLocaleString()}`
                    : `${stats.volumeChangePercent >= 0 ? "+" : ""}${stats.volumeChangePercent}%`
                }
              />
            </div>
          )}
          <p className="mono-copy mt-3 text-xs leading-5 text-label">
            Logged {stats.totalSets} sets across {stats.sessionsLogged} sessions.
          </p>
        </>
      ) : (
        <p className="mono-copy mt-2 text-sm leading-6 text-label">No prior stats yet. This set starts the history.</p>
      )}
    </div>
  );
}

function ExerciseInfoPanel({
  cues,
  substitutions,
  painFlags,
  onPainToggle,
  onSwap
}: {
  cues: string[];
  substitutions: ReturnType<typeof findSubstitutions>;
  painFlags: string[];
  onPainToggle: (flag: string) => void;
  onSwap: (exerciseId: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">Cues</p>
      <p className="mono-copy mt-1 text-sm leading-6 text-label">{cues.join(" ")}</p>
      <p className="mt-4 text-sm font-bold text-ink">Swaps</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {substitutions.map((substitution) => (
          <button
            key={substitution.id}
            className="tap-target card-hover rounded-full border border-[#2563eb]/20 bg-[#e8eeff] px-3 py-2 text-xs font-semibold text-[#2563eb]"
            onClick={() => onSwap(substitution.id)}
            type="button"
          >
            <Repeat2 className="mr-1 inline size-3" aria-hidden />
            {substitution.name}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-ink">Pain flags</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {painOptions.map((flag) => (
          <SelectableChip key={flag} active={painFlags.includes(flag)} onClick={() => onPainToggle(flag)}>
            {flag.replace("_", " ")}
          </SelectableChip>
        ))}
      </div>
    </div>
  );
}

function PanelOverlay({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-black/6 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="chunky-title text-3xl font-black leading-none text-ink">{title}</h2>
          <button className="rounded-full border border-black/8 bg-surface px-4 py-2 text-sm font-bold text-ink" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/6 bg-surface p-3">
      <p className="mono-copy text-xs text-label">{label}</p>
      <p className="mt-1 text-xl font-black leading-none text-ink">{value}</p>
    </div>
  );
}

function WorkoutScorecard({
  loggedSets,
  totalSets,
  workout,
  sessions,
  painFlags,
  swaps,
}: {
  loggedSets: LoggedSet[];
  totalSets: number;
  workout: WorkoutTemplate;
  sessions: WorkoutSession[];
  painFlags: string[];
  swaps: Record<string, string>;
}) {
  const router = useRouter();
  const [effort, setEffort] = useState<PerceivedEffort | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const totalVolume = loggedSets.reduce((sum, set) => {
    if (set.weight === 0 && set.reps === 0 && set.durationSeconds) return sum + set.durationSeconds;
    return sum + (set.weight ?? 0) * set.reps;
  }, 0);
  const sessionResult = scoreSession(loggedSets.map((s) => ({ ...s, weight: s.weight ?? 0 })), workout, sessions);
  const newPRs = detectNewPRs(loggedSets.map((s) => ({ ...s, weight: s.weight ?? 0 })), sessions);

  async function handleFinish() {
    setSaving(true);
    try {
      const r = await fetch("/api/workout/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: workout.id,
          sets: loggedSets.map((s) => ({ ...s, weight: s.weight ?? 0 })),
          painFlags,
          effort,
          swappedExerciseIds: swaps,
        }),
      });
      if (r.ok) {
        router.push("/");
      } else {
        setSaveError(true);
        setSaving(false);
      }
    } catch {
      setSaveError(true);
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-[#2563eb]/20 bg-[#e8eeff] p-5 shadow-card">
        <p className="text-sm font-semibold text-[#2563eb]">Workout complete</p>
        <h2 className="chunky-title mt-3 text-5xl font-black leading-none text-ink">Scorecard</h2>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <ScoreMetric label="Sets" value={`${loggedSets.length}/${totalSets}`} />
          <ScoreMetric label="Volume" value={`${Math.round(totalVolume / 1000 * 10) / 10}k lb`} />
          <ScoreMetric label="Score" value={`${sessionResult.score}`} />
        </div>
        <p className="mono-copy mt-3 text-xs leading-5 text-[#2563eb]/80">{sessionResult.context}</p>
      </div>

      {newPRs.length > 0 && (
        <div className="rounded-3xl border border-[#f59e0b]/20 bg-[#fffbeb] p-5">
          <p className="text-sm font-bold text-[#92400e]">Personal records</p>
          <div className="mt-3 space-y-2">
            {newPRs.map((pr) => (
              <div key={`${pr.exerciseId}-${pr.type}`} className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">{pr.exerciseName}</p>
                <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-xs font-black text-white">
                  {pr.type === "weight" ? `${pr.value} lb` : pr.type === "duration" ? `${pr.value}s` : `${pr.value} vol`} PR
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-black/6 bg-white p-5 shadow-card">
        <p className="text-sm font-bold text-ink">How did that feel?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {EFFORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setEffort(option.value)}
              className={`tap-target rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                effort === option.value
                  ? "border-[#2563eb]/30 bg-[#2563eb] text-white"
                  : "border-black/8 bg-surface text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {saveError && (
        <p className="mono-copy text-center text-xs text-[#dc2626]">
          Save failed — check your connection and try again.
        </p>
      )}

      {loggedSets.length === 0 && (
        <p className="mono-copy text-center text-xs text-label">
          No sets logged — log at least one set to save this session.
        </p>
      )}
      <button
        type="button"
        disabled={saving || loggedSets.length === 0}
        onClick={handleFinish}
        className="flex w-full items-center justify-center rounded-3xl bg-ink py-4 text-lg font-black text-white shadow-card disabled:opacity-40"
      >
        {saving ? "Saving…" : saveError ? "Save failed — try again" : "Done"}
      </button>
    </section>
  );
}

function ScoreMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/6 bg-white p-3 shadow-card">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold text-label">{label}</p>
    </div>
  );
}

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function shortExerciseName(name: string): string {
  return name
    .replace("Smith Machine ", "")
    .replace("Machine ", "")
    .replace("Dumbbell ", "")
    .replace("Cable ", "")
    .replace("Seated ", "")
    .replace("Rope ", "");
}
