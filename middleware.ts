import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/session";

/**
 * First line of defense for the Admin CMS: runs on the Edge, before
 * any page render or Server Action, and redirects/rejects unauthenticated
 * requests before they ever reach admin code. `lib/admin/auth.ts`'s
 * `requireAdminSession()` is the second, defense-in-depth layer inside
 * the dashboard layout itself, for the (unlikely, but not
 * impossible-to-misconfigure) case this middleware is ever bypassed.
 *
 * /admin/login is deliberately excluded from the matcher below via the
 * negative lookahead — everything else under /admin requires a valid
 * session cookie.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // NOTE: the slash sits INSIDE the negative lookahead
    // (`(?!/login)`), not between `admin` and the group. Writing it as
    // `/admin/((?!login).*)` instead — a `/` literally between `admin`
    // and the group — requires at least one character after
    // `/admin/`, which means it silently never matches the bare
    // `/admin` path (the dashboard home) at all. That was caught in
    // testing: `/admin/articles` correctly redirected unauthenticated
    // requests, but `/admin` itself rendered with a 200, wide open.
    "/admin((?!/login).*)",
    "/api/admin/((?!auth/login).*)",
  ],
};
