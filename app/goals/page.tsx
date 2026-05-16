"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

const PRIORITIES: Array<{ label: string; value: string }> = [
  { label: "Muscle gain",    value: "muscle_gain"    },
  { label: "Strength",       value: "strength"       },
  { label: "Fat loss",       value: "fat_loss"       },
  { label: "Consistency",    value: "consistency"    },
  { label: "General health", value: "general_health" },
];

const EQUIPMENT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Smith machine", value: "smith_machine" },
  { label: "Dumbbells",     value: "dumbbell"      },
  { label: "Machines",      value: "machine"       },
  { label: "Cable stack",   value: "cable"         },
  { label: "Bodyweight",    value: "bodyweight"    },
];

const DAY_OPTIONS = [2, 3, 4, 5, 6];

export default function GoalsPage() {
  const [goal, setGoal] = useState("muscle_gain");
  const [days, setDays] = useState(3);
  const [equipment, setEquipment] = useState<string[]>(["smith_machine", "dumbbell", "machine", "cable", "bodyweight"]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((profile) => {
        if (!profile) return;
        if (profile.goalPriority) setGoal(profile.goalPriority);
        if (profile.trainingDaysPerWeek) setDays(profile.trainingDaysPerWeek);
        if (Array.isArray(profile.equipmentAccess) && profile.equipmentAccess.length > 0) {
          setEquipment(profile.equipmentAccess);
        }
      })
      .catch(() => null);
  }, []);

  function toggleEquipment(value: string) {
    setEquipment((current: string[]) =>
      current.includes(value) ? current.filter((item: string) => item !== value) : [...current, value]
    );
  }

  async function handleSave() {
    setSaveState("saving");
    try {
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalPriority: goal, trainingDaysPerWeek: days, equipmentAccess: equipment }),
      });
      setSaveState(r.ok ? "saved" : "error");
      if (r.ok) setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  }

  return (
    <AppShell eyebrow="Setup" title="What matters to you">
      <p className="-mt-3 text-sm leading-6 text-label">
        Defaults to hypertrophy, a 3-day full-body split, and Planet Fitness equipment.
      </p>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Primary goal</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PRIORITIES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGoal(option.value)}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${
                goal === option.value
                  ? "border-[#2563eb]/30 bg-[#2563eb] text-white shadow-card"
                  : "border-black/8 bg-surface text-ink hover:border-[#2563eb]/30 hover:bg-[#e8eeff]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Weekly structure</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DAY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDays(n)}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                days === n
                  ? "border-[#7c3aed]/30 bg-[#7c3aed] text-white"
                  : "border-black/8 bg-surface text-ink hover:border-[#7c3aed]/30 hover:bg-[#f3eeff]"
              }`}
            >
              {n} days
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Equipment available</h2>
        <div className="mt-3 space-y-2">
          {EQUIPMENT_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => toggleEquipment(item.value)}
              className="flex w-full items-center justify-between rounded-2xl border border-black/6 bg-surface px-4 py-3 transition hover:bg-[#e8eeff]"
            >
              <span className="text-sm font-medium text-ink">{item.label}</span>
              {equipment.includes(item.value) && <Check className="size-4 text-[#16a34a]" />}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saveState === "saving"}
        className="tap-target w-full rounded-full bg-[#2563eb] px-4 py-4 font-bold text-white shadow-card transition active:scale-[0.98] disabled:opacity-50"
      >
        {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : saveState === "error" ? "Save failed — try again" : "Save setup"}
      </button>

      <Link
        href="/library"
        className="flex items-center justify-between rounded-2xl border border-black/6 bg-white px-4 py-4 shadow-card"
      >
        <div>
          <p className="text-sm font-bold text-ink">Exercise library</p>
          <p className="mt-0.5 text-xs text-label">Browse all Planet Fitness-ready lifts</p>
        </div>
        <ArrowRight className="size-4 text-label" aria-hidden />
      </Link>
    </AppShell>
  );
}
