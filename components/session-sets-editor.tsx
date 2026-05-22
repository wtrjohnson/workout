"use client";

import { useState } from "react";

type SetRow = {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  durationSeconds: number | null;
};

type ExerciseGroup = {
  exerciseId: string;
  exerciseName: string;
  isTimeBased: boolean;
  originalName: string | null;
  sets: SetRow[];
};

export function SessionSetsEditor({
  sessionId,
  exerciseGroups,
}: {
  sessionId: string;
  exerciseGroups: ExerciseGroup[];
}) {
  const [groups, setGroups] = useState(exerciseGroups);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateSet(exerciseId: string, setNumber: number, field: "weight" | "reps" | "durationSeconds", raw: string) {
    const val = raw === "" ? 0 : Number(raw);
    setGroups((prev) =>
      prev.map((g) =>
        g.exerciseId !== exerciseId
          ? g
          : {
              ...g,
              sets: g.sets.map((s) =>
                s.setNumber === setNumber ? { ...s, [field]: isNaN(val) ? 0 : val } : s
              ),
            }
      )
    );
  }

  async function saveExercise(exerciseId: string) {
    const group = groups.find((g) => g.exerciseId === exerciseId);
    if (!group) return;

    setSaving(exerciseId);
    setError(null);

    try {
      const res = await fetch(`/api/workout/${sessionId}/sets`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sets: group.sets.map((s) => ({
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            durationSeconds: s.durationSeconds ?? undefined,
          })),
        }),
      });

      if (res.ok) {
        setSaved(exerciseId);
        setEditingExercise(null);
        setTimeout(() => setSaved(null), 2000);
      } else {
        setError("Save failed — try again");
      }
    } catch {
      setError("Save failed — check connection");
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="space-y-3">
      {groups.map((group) => {
        const isEditing = editingExercise === group.exerciseId;
        const isSaving = saving === group.exerciseId;
        const justSaved = saved === group.exerciseId;

        return (
          <article key={group.exerciseId} className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-ink">{group.exerciseName}</h2>
                {group.originalName && (
                  <p className="mt-0.5 text-xs text-label">swap from {group.originalName}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-label">
                  {group.sets.length} {group.sets.length === 1 ? "set" : "sets"}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExercise(group.exerciseId);
                      setError(null);
                    }}
                    className="rounded-full border border-black/8 bg-surface px-3 py-1 text-xs font-semibold text-ink"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {group.sets.map((set) => (
                <div key={set.setNumber} className="flex items-center gap-2 text-sm">
                  <span className="mono-copy w-5 text-xs text-label">{set.setNumber}</span>
                  {isEditing ? (
                    group.isTimeBased ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          className="w-16 rounded-lg border border-black/12 bg-surface px-2 py-1 text-sm font-medium text-ink"
                          value={set.durationSeconds ?? 0}
                          onChange={(e) => updateSet(group.exerciseId, set.setNumber, "durationSeconds", e.target.value)}
                        />
                        <span className="text-xs text-label">s</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          className="w-16 rounded-lg border border-black/12 bg-surface px-2 py-1 text-sm font-medium text-ink"
                          value={set.weight}
                          onChange={(e) => updateSet(group.exerciseId, set.setNumber, "weight", e.target.value)}
                        />
                        <span className="text-xs text-label">lb ×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          className="w-12 rounded-lg border border-black/12 bg-surface px-2 py-1 text-sm font-medium text-ink"
                          value={set.reps}
                          onChange={(e) => updateSet(group.exerciseId, set.setNumber, "reps", e.target.value)}
                        />
                      </div>
                    )
                  ) : (
                    <span className="font-medium text-ink">
                      {group.isTimeBased && set.durationSeconds != null
                        ? `${set.durationSeconds}s`
                        : `${set.weight} lb × ${set.reps}`}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => saveExercise(group.exerciseId)}
                  className="rounded-2xl bg-ink px-4 py-2 text-sm font-black text-white disabled:opacity-40"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingExercise(null);
                    setGroups(exerciseGroups);
                    setError(null);
                  }}
                  className="rounded-2xl border border-black/8 bg-surface px-4 py-2 text-sm font-semibold text-ink"
                >
                  Cancel
                </button>
                {error && <p className="mono-copy text-xs text-[#dc2626]">{error}</p>}
              </div>
            )}

            {justSaved && (
              <p className="mono-copy mt-2 text-xs text-[#16a34a]">Saved</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
