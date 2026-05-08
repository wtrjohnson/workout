import { NextResponse } from "next/server";
import { getSessions, saveSession } from "@/lib/db/queries";
import type { SaveSessionInput } from "@/lib/db/queries";

export async function GET(): Promise<Response> {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as SaveSessionInput;

    if (!body.templateKey || !Array.isArray(body.sets)) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 });
    }

    const id = await saveSession(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
