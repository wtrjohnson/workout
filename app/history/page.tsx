export const dynamic = "force-dynamic";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getSessionHistory } from "@/lib/db/queries";
import { exercises } from "@/lib/training/data";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function effortLabel(effort: string | null): string {
  const map: Record<string, string> = {
    easy: "Easy",
    comfortable: "Comfortable",
    moderate: "Just right",
    hard: "Hard",
    very_hard: "Wrecked",
  };
  return effort ? (map[effort] ?? effort) : "";
}

export default async function HistoryPage() {
  const sessions = await getSessionHistory();

  return (
    <AppShell eyebrow="Your log" title="Session history">
      {sessions.length === 0 ? (
        <p className="mono-copy text-center text-sm text-label">
          No sessions logged yet. Complete a workout to see it here.
        </p>
      ) : (
        <section className="space-y-2">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/history/${session.id}`}
              className="card-hover flex items-center justify-between rounded-2xl border border-black/6 bg-white px-4 py-4 shadow-card"
            >
              <div className="min-w-0">
                <p className="mono-copy text-xs text-label">{formatDate(session.date)}</p>
                <h2 className="mt-0.5 truncate text-sm font-bold text-ink">
                  {session.templateTitle ?? "Freestyle session"}
                </h2>
                <p className="mt-0.5 text-xs text-label">
                  {session.setCount} sets
                  {session.templateFocus ? ` · ${session.templateFocus}` : ""}
                  {session.perceivedEffort ? ` · ${effortLabel(session.perceivedEffort)}` : ""}
                </p>
              </div>
              <ChevronRight className="ml-3 size-4 shrink-0 text-label" aria-hidden />
            </Link>
          ))}
        </section>
      )}
    </AppShell>
  );
}
