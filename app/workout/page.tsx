export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { WorkoutLogger } from "@/components/workout-logger";
import { getProgram, getSessionsWithSets, getTemplates } from "@/lib/db/queries";
import { getNextTemplate } from "@/lib/training/logic";

export default async function WorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const [{ templateId }, sessions, templates, program, headersList] = await Promise.all([
    searchParams,
    getSessionsWithSets(),
    getTemplates(),
    getProgram(),
    headers(),
  ]);
  const timeZone = headersList.get("x-vercel-ip-timezone") ?? "America/New_York";
  const schedule = program?.schedule ?? [];
  const explicit = templateId ? templates.find((t) => t.id === templateId) : null;
  const workout = explicit ?? (templates.length > 0 ? getNextTemplate(sessions, templates, new Date(), schedule, timeZone) : null);

  if (!workout) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-surface px-4 text-ink">
        <p className="text-sm text-label">No program loaded. Run setup first.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-surface px-4 pb-8 pt-6 text-ink" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
      <header className="mb-5">
        <p className="mono-copy text-xs font-semibold uppercase tracking-widest text-label">Workout mode</p>
        <h1 className="chunky-title mt-1 text-4xl font-black leading-[0.9] text-ink">{workout.title}</h1>
        <p className="mt-1 text-sm text-label">{workout.focus}</p>
      </header>
      <div className="flex flex-1 flex-col gap-4">
        <WorkoutLogger workout={workout} sessions={sessions} />
      </div>
    </main>
  );
}
