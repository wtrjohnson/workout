"use client";

import { useRouter } from "next/navigation";

export function SkipWorkoutButton({ today, pushedToLabel }: { today: string; pushedToLabel: string | null }) {
  const router = useRouter();

  async function handleSkip() {
    await fetch("/api/skip-workout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleSkip}
      type="button"
      className="mono-copy mt-3 text-xs text-label underline underline-offset-2"
    >
      {pushedToLabel
        ? `Not going today — move to ${pushedToLabel}`
        : "Not going today — move to tomorrow"}
    </button>
  );
}
