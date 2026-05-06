"use client";

import { Clock, Repeat2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SelectableChip } from "@/components/selectable-chip";
import { demoSessions } from "@/lib/training/data";
import {
  buildWorkoutSteps,
  findSubstitutions,
  getExerciseStats,
  getExercise,
  getRestSeconds,
  getSuggestedSet
} from "@/lib/training/logic";
import type { WorkoutTemplate } from "@/lib/training/types";

type LoggedSet = {
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number;
};

type WorkoutMode = "active" | "resting" | "complete";
type ActivePanel = "history" | "info" | null;

const painOptions = ["shoulder", "knee", "lower_back"] as const;

export function WorkoutLogger({ workout }: { workout: WorkoutTemplate }) {
  const steps = useMemo(() => buildWorkoutSteps(workout), [workout]);
  const [mode, setMode] = useState<WorkoutMode>("active");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [painFlags, setPainFlags] = useState<string[]>([]);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const activeStep = steps[activeStepIndex];
  const currentExerciseId = swaps[activeStep.planned.exerciseId] ?? activeStep.planned.exerciseId;
  const currentPlanned = { ...activeStep.planned, exerciseId: currentExerciseId };
  const currentExercise = getExercise(currentExerciseId);
  const suggested = getSuggestedSet(currentPlanned, activeStep.setIndex, demoSessions);
  const [weight, setWeight] = useState<number | null>(suggested.weight);
  const [reps, setReps] = useState(suggested.reps);
  const restSeconds = getRestSeconds(currentPlanned);
  const [remainingRest, setRemainingRest] = useState(restSeconds);

  const substitutions = findSubstitutions(currentExerciseId, painFlags);
  const exerciseStats = getExerciseStats(currentExerciseId, demoSessions);
  const nextStep = steps[activeStepIndex + 1];
  const progress = Math.round((loggedSets.length / steps.length) * 100);

  useEffect(() => {
    const nextSuggestion = getSuggestedSet(currentPlanned, activeStep.setIndex, demoSessions);
    setWeight(nextSuggestion.weight);
    setReps(nextSuggestion.reps);
    setRemainingRest(getRestSeconds(currentPlanned));
  }, [activeStep.setIndex, currentExerciseId]);

  useEffect(() => {
    if (mode !== "resting") return;
    if (remainingRest <= 0) {
      goToNextStep();
      return;
    }

    const timer = window.setTimeout(() => setRemainingRest((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [mode, remainingRest]);

  function completeSet() {
    const completedSet: LoggedSet = {
      exerciseId: currentExerciseId,
      setNumber: activeStep.setIndex + 1,
      weight,
      reps
    };

    setLoggedSets((current) => [...current, completedSet]);

    if (activeStepIndex >= steps.length - 1) {
      setMode("complete");
      return;
    }

    setRemainingRest(restSeconds);
    setMode("resting");
  }

  function goToNextStep() {
    if (activeStepIndex >= steps.length - 1) {
      setMode("complete");
      return;
    }

    setActiveStepIndex((current) => current + 1);
    setMode("active");
  }

  function togglePain(flag: string) {
    setPainFlags((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));
  }

  function swapExercise(nextExerciseId: string) {
    setSwaps((current) => ({ ...current, [activeStep.planned.exerciseId]: nextExerciseId }));
    setActivePanel(null);
  }

  if (mode === "complete") {
    return <WorkoutScorecard loggedSets={loggedSets} totalSets={steps.length} />;
  }

  if (mode === "resting") {
    return (
      <RestScreen
        remainingRest={remainingRest}
        restSeconds={restSeconds}
        nextLabel={nextStep ? getExercise(swaps[nextStep.planned.exerciseId] ?? nextStep.planned.exerciseId).name : "Scorecard"}
        nextSet={nextStep ? nextStep.setIndex + 1 : null}
        onAddTime={() => setRemainingRest((current) => current + 30)}
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
          Set {activeStep.setIndex + 1} of {activeStep.planned.targetSets} · tap name for form cues
        </p>
      </section>

      <section className="rounded-3xl bg-[#2563eb] px-5 py-7">
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
      </section>

      <div className="flex items-center gap-3">
        <button
          className="tap-target flex-1 rounded-3xl bg-ink px-5 py-4 text-3xl font-black leading-none text-white shadow-card"
          onClick={completeSet}
          type="button"
        >
          Log set
        </button>
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
            <ExerciseStatsPanel stats={exerciseStats} suggestion={suggested.reason} />
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
  restSeconds,
  nextLabel,
  nextSet,
  onAddTime,
  onSkip
}: {
  remainingRest: number;
  restSeconds: number;
  nextLabel: string;
  nextSet: number | null;
  onAddTime: () => void;
  onSkip: () => void;
}) {
  const progress = Math.max(0, Math.min(100, Math.round((remainingRest / restSeconds) * 100)));

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
      <div className="mt-10 flex justify-center gap-4">
        <button className="tap-target rounded-3xl border border-black/8 bg-white px-5 py-3 text-xl font-black leading-none text-ink shadow-card" onClick={onAddTime} type="button">
          +30 sec
        </button>
        <button className="tap-target rounded-3xl bg-ink px-5 py-3 text-xl font-black leading-none text-white shadow-card" onClick={onSkip} type="button">
          skip rest
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

function ExerciseStatsPanel({ stats, suggestion }: { stats: ReturnType<typeof getExerciseStats>; suggestion: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">Exercise history</p>
      <div className="mt-3 rounded-2xl border border-black/6 bg-surface p-3">
        <p className="mono-copy text-xs text-label">Suggestion</p>
        <p className="mono-copy mt-1 text-sm leading-6 text-ink">{suggestion}</p>
      </div>
      {stats.lastSets.length > 0 ? (
        <>
          <div className="mt-3 rounded-2xl border border-black/6 bg-surface p-3">
            <p className="mono-copy text-xs text-label">Last time</p>
            <p className="mono-copy mt-1 text-sm leading-6 text-ink">
              {stats.lastSets.map((set) => `${set.weight} x ${set.reps}`).join(", ")}
            </p>
          </div>
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

function WorkoutScorecard({ loggedSets, totalSets }: { loggedSets: LoggedSet[]; totalSets: number }) {
  const totalVolume = loggedSets.reduce((sum, set) => sum + (set.weight ?? 0) * set.reps, 0);

  return (
    <section className="rounded-3xl border border-[#2563eb]/20 bg-[#e8eeff] p-5 shadow-card">
      <p className="text-sm font-semibold text-[#2563eb]">Workout complete</p>
      <h2 className="chunky-title mt-3 text-5xl font-black leading-none text-ink">Scorecard</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <ScoreMetric label="Sets logged" value={`${loggedSets.length}/${totalSets}`} />
        <ScoreMetric label="Volume" value={`${Math.round(totalVolume).toLocaleString()} lb`} />
      </div>
      <p className="mt-5 text-sm leading-6 text-label">
        Prototype logging is complete for this session. The next persistence pass can save these exact completed sets to Neon.
      </p>
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
