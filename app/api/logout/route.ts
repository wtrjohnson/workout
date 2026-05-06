import { NextResponse } from "next/server";
import { authCookieName } from "@/lib/auth/passcode";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/login", url.origin), 303);
  response.cookies.delete(authCookieName());
  return response;
}

