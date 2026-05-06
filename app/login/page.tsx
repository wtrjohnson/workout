import { Dumbbell } from "lucide-react";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === "1";

  return (
    <main className="contour-bg grid min-h-screen place-items-center px-5 text-white">
      <section className="w-full max-w-md rounded-[2.2rem] bg-[#101010] p-6">
        <div className="grid size-14 place-items-center rounded-2xl bg-[#5a007a] text-white">
          <Dumbbell className="size-7" aria-hidden />
        </div>
        <p className="mono-copy mt-8 text-sm text-white/62">Private workout console</p>
        <h1 className="chunky-title mt-2 text-5xl font-black leading-[0.9] text-white">Welcome back</h1>
        <form action="/api/login" className="mt-7 space-y-4" method="post">
          <label className="block">
            <span className="mono-copy text-sm text-white/70">Passcode</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-xl font-black text-white outline-none focus:border-[#ba00ff]"
              name="passcode"
              required
              type="password"
            />
          </label>
          {hasError ? <p className="mono-copy text-sm text-[#ff8a8a]">That passcode did not match.</p> : null}
          <button className="tap-target w-full rounded-2xl bg-[#008415] px-5 py-4 text-2xl font-black text-white" type="submit">
            Unlock app
          </button>
        </form>
      </section>
    </main>
  );
}

