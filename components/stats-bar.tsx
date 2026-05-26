import { Flag, Flame } from "lucide-react";

type Props = {
  streakDays: number;
  monthlySessions: number;
  weeklyCompleted: number;
  weeklyGoal: number;
};

export function StatsBar({ streakDays, monthlySessions, weeklyCompleted, weeklyGoal }: Props) {
  return (
    <section className="mb-6 grid grid-cols-3 gap-2 rounded-3xl bg-[#eef0f3] p-4">
      <Cell
        icon={<Flame className="size-5 text-[#f97316]" aria-hidden />}
        label="STREAK"
        value={`${streakDays} ${streakDays === 1 ? "day" : "days"}`}
      />
      <Cell
        icon={<PersonIcon />}
        label="THIS MONTH"
        value={`${monthlySessions} ${monthlySessions === 1 ? "session" : "sessions"}`}
      />
      <Cell
        icon={<Flag className="size-5 text-[#16a34a]" aria-hidden />}
        label="WEEKLY GOAL"
        value={`${weeklyCompleted}/${weeklyGoal}`}
      />
    </section>
  );
}

function Cell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-bold tracking-wider text-label">{label}</span>
      </div>
      <span className="text-base font-black leading-tight text-ink">{value}</span>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#2563eb]" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="2.4" />
      <path d="M8.2 10.2c.7-.7 1.7-1.2 2.8-1.2h2c1.1 0 2.1.5 2.8 1.2L18 13l-1.3 1.3-2-2v3.5l2 5.2-1.6.6-2-5.1h-2.2l-2 5.1-1.6-.6 2-5.2V12.3l-2 2L6 13l2.2-2.8Z" />
    </svg>
  );
}
