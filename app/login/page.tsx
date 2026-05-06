import { Dumbbell } from "lucide-react";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === "1";

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <section className="w-full max-w-md rounded-3xl border border-black/6 bg-white p-6 shadow-soft">
        <div className="grid size-14 place-items-center rounded-2xl bg-[#2563eb] text-white">
          <Dumbbell className="size-7" aria-hidden />
        </div>
        <p className="mono-copy mt-8 text-xs font-semibold uppercase tracking-widest text-label">Private workout console</p>
        <h1 className="chunky-title mt-2 text-5xl font-black leading-[0.9] text-ink">Welcome back</h1>
        <form action="/api/login" className="mt-7 space-y-4" method="post">
          <label className="block">
            <span className="mono-copy text-sm font-medium text-label">Passcode</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-black/10 bg-surface px-4 py-4 text-xl font-black text-ink outline-none focus:border-[#2563eb]/50 focus:ring-2 focus:ring-[#2563eb]/8"
              name="passcode"
              required
              type="password"
            />
          </label>
          {hasError ? <p className="mono-copy text-sm text-red-500">That passcode did not match.</p> : null}
          <button className="tap-target w-full rounded-2xl bg-[#2563eb] px-5 py-4 text-lg font-black text-white shadow-card transition active:scale-[0.98]" type="submit">
            Unlock app
          </button>
        </form>
      </section>
    </main>
  );
}
