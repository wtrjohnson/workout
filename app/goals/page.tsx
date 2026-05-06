import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const priorities = ["Muscle gain", "Strength", "Fat loss", "Consistency", "General health"];
const equipment = ["Smith machine", "Dumbbells", "Machines", "Cable stack", "Bodyweight"];

export default function GoalsPage() {
  return (
    <AppShell eyebrow="Setup" title="Tell the app what matters">
      <p className="-mt-3 text-sm leading-6 text-fog/70">
        V1 defaults to hypertrophy, a 3-day full-body split, and Planet Fitness equipment.
      </p>

      <section className="glass-panel rounded-[1.5rem] p-4">
        <h2 className="text-base font-semibold text-ink">Primary goal</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {priorities.map((priority) => (
            <button
              key={priority}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                priority === "Muscle gain" ? "border-sand/70 bg-sand text-night shadow-glow" : "border-line bg-white/5 text-fog"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.5rem] p-4">
        <h2 className="text-base font-semibold text-ink">Weekly structure</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[2, 3, 4, 5, 6].map((days) => (
            <button
              key={days}
              className={`tap-target card-hover rounded-2xl border px-3 py-3 text-sm font-semibold ${
                days === 3 ? "border-violet/60 bg-violet/18 text-lavender" : "border-line bg-white/5 text-fog/70"
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.5rem] p-4">
        <h2 className="text-base font-semibold text-ink">Equipment available</h2>
        <div className="mt-3 space-y-2">
          {equipment.map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-line bg-white/5 px-3 py-3">
              <span className="text-sm font-medium text-ink">{item}</span>
              <Check className="size-4 text-moss" />
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.5rem] p-4">
        <h2 className="text-base font-semibold text-ink">Plan import</h2>
        <textarea
          className="dark-input mt-3 min-h-32 w-full resize-none rounded-2xl p-3 text-sm"
          placeholder="Later: paste your Claude plan here and convert it into structured workouts."
        />
      </section>

      <button className="tap-target w-full rounded-full bg-sand px-4 py-4 font-bold text-night shadow-glow transition active:scale-[0.98]">
        Save setup
      </button>
    </AppShell>
  );
}
