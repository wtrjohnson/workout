import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { date } = await request.json() as { date: string };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("workout_skipped", date, {
    httpOnly: false,
    maxAge: 60 * 60 * 48,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
