"use client";

import { Search } from "lucide-react";
import React, { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { exercises } from "@/lib/training/data";

export default function LibraryPage() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? exercises.filter((exercise) => {
        const q = query.toLowerCase();
        return (
          exercise.name.toLowerCase().includes(q) ||
          exercise.movementPattern.replaceAll("_", " ").includes(q) ||
          exercise.primaryMuscles.some((m) => m.replaceAll("_", " ").includes(q)) ||
          exercise.equipment.some((e) => e.replaceAll("_", " ").includes(q))
        );
      })
    : exercises;

  return (
    <AppShell eyebrow="Exercise library" title="Planet Fitness lifts">
      <label className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-3 shadow-card">
        <Search className="size-4 text-label" />
        <input
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-label/60"
          placeholder="Search by lift, muscle, equipment"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
      </label>

      {filtered.length === 0 && (
        <p className="mono-copy text-center text-sm text-label">No exercises match &ldquo;{query}&rdquo;</p>
      )}

      <section className="space-y-2">
        {filtered.map((exercise) => (
          <article key={exercise.id} className="card-hover animate-rise-in rounded-2xl border border-black/6 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-ink">{exercise.name}</h2>
                <p className="mt-0.5 text-xs capitalize text-label">{exercise.movementPattern.replaceAll("_", " ")}</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#2563eb]/20 bg-[#e8eeff] px-2 py-1 text-xs font-semibold text-[#2563eb]">
                PF
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {exercise.primaryMuscles.map((muscle) => (
                <span key={muscle} className="rounded-full bg-[#e8eeff] px-2 py-0.5 text-xs font-medium text-[#2563eb]">
                  {muscle.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
