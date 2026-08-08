import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/admin/session";

/** Returns the current admin session, or null if absent/expired/tampered. Never throws. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * For Server Components under app/admin/(dashboard) — redirects to
 * /admin/login if there's no valid session. middleware.ts already
 * blocks these routes at the edge; this is the second, defense-in-depth
 * layer that runs even if middleware is ever bypassed or misconfigured.
 */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Signs in the given admin email — sets the httpOnly session cookie. Called only after password verification. */
export async function createAdminSession(email: string): Promise<void> {
  const token = await createSessionToken(email);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears the session cookie. */
export function clearAdminSession(): void {
  cookies().delete(SESSION_COOKIE_NAME);
}
