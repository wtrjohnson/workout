import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const priorities = ["Muscle gain", "Strength", "Fat loss", "Consistency", "General health"];
const equipment = ["Smith machine", "Dumbbells", "Machines", "Cable stack", "Bodyweight"];

export default function GoalsPage() {
  return (
    <AppShell eyebrow="Setup" title="What matters to you">
      <p className="-mt-3 text-sm leading-6 text-label">
        V1 defaults to hypertrophy, a 3-day full-body split, and Planet Fitness equipment.
      </p>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Primary goal</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {priorities.map((priority) => (
            <button
              key={priority}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${
                priority === "Muscle gain"
                  ? "border-[#2563eb]/30 bg-[#2563eb] text-white shadow-card"
                  : "border-black/8 bg-surface text-ink hover:border-[#2563eb]/30 hover:bg-[#e8eeff]"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Weekly structure</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[2, 3, 4, 5, 6].map((days) => (
            <button
              key={days}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                days === 3
                  ? "border-[#7c3aed]/30 bg-[#7c3aed] text-white"
                  : "border-black/8 bg-surface text-ink hover:border-[#7c3aed]/30 hover:bg-[#f3eeff]"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Equipment available</h2>
        <div className="mt-3 space-y-2">
          {equipment.map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-black/6 bg-surface px-4 py-3">
              <span className="text-sm font-medium text-ink">{item}</span>
              <Check className="size-4 text-[#16a34a]" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/6 bg-white p-4 shadow-card">
        <h2 className="text-base font-bold text-ink">Plan import</h2>
        <textarea
          className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-black/8 bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-label focus:border-[#7c3aed]/40 focus:ring-2 focus:ring-[#7c3aed]/8"
          placeholder="Later: paste your Claude plan here and convert it into structured workouts."
        />
      </section>

      <button className="tap-target w-full rounded-full bg-[#2563eb] px-4 py-4 font-bold text-white shadow-card transition active:scale-[0.98]">
        Save setup
      </button>
    </AppShell>
  );
}
