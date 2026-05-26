import { NextResponse } from "next/server";
import { insertCoachReply } from "@/lib/db/queries";

export async function POST(request: Request) {
  const { body, contextKind } = (await request.json()) as {
    body?: string;
    contextKind?: string | null;
  };

  const trimmed = (body ?? "").trim();
  if (!trimmed) return NextResponse.json({ error: "empty body" }, { status: 400 });
  if (trimmed.length > 500) return NextResponse.json({ error: "too long" }, { status: 400 });

  await insertCoachReply({ body: trimmed, contextKind: contextKind ?? null });
  return NextResponse.json({ ok: true });
}
