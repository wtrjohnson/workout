const AUTH_COOKIE = "workout_auth";

export function authCookieName() {
  return AUTH_COOKIE;
}

export function isPasscodeConfigured() {
  return Boolean(process.env.APP_PASSCODE && process.env.AUTH_SECRET);
}

export async function createPasscodeToken(passcode = process.env.APP_PASSCODE ?? "") {
  const secret = process.env.AUTH_SECRET ?? "";
  const input = new TextEncoder().encode(`${secret}:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAuthToken(token?: string | null) {
  if (!isPasscodeConfigured()) return true;
  if (!token) return false;

  return token === (await createPasscodeToken());
}

