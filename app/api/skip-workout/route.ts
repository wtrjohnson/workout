import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { date } = await request.json() as { date: string };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + 1);
  const tomorrow = d.toLocaleDateString("en-CA"); // YYYY-MM-DD

  const cookieOptions = {
    httpOnly: false,
    maxAge: 60 * 60 * 48,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set("workout_skipped", date, cookieOptions);
  response.cookies.set("workout_pushed_to", tomorrow, cookieOptions);
  return response;
}
