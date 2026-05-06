import { NextResponse, type NextRequest } from "next/server";
import { authCookieName, isPasscodeConfigured, isValidAuthToken } from "@/lib/auth/passcode";

export async function proxy(request: NextRequest) {
  if (!isPasscodeConfigured()) return NextResponse.next();

  const valid = await isValidAuthToken(request.cookies.get(authCookieName())?.value);
  if (valid) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api/login|api/logout|login|_next/static|_next/image|favicon.ico|icon.svg|sw.js|manifest.webmanifest).*)"]
};
