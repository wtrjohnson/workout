import { NextResponse } from "next/server";
import { authCookieName, createPasscodeToken, isPasscodeConfigured } from "@/lib/auth/passcode";

export async function POST(request: Request) {
  const formData = await request.formData();
  const passcode = String(formData.get("passcode") ?? "");
  const expected = process.env.APP_PASSCODE ?? "";
  const url = new URL(request.url);

  if (isPasscodeConfigured() && passcode !== expected) {
    return NextResponse.redirect(new URL("/login?error=1", url.origin), 303);
  }

  const response = NextResponse.redirect(new URL("/", url.origin), 303);
  response.cookies.set(authCookieName(), await createPasscodeToken(passcode), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

