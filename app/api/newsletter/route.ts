import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Newsletter subscription endpoint.
 *
 * Talks to Resend's Audiences API directly over fetch (no SDK — this
 * is one JSON POST, so adding the `resend` package would be an
 * unnecessary dependency for what it does). Requires two environment
 * variables, set in Vercel Project Settings -> Environment Variables
 * (see .env.example):
 *
 *   RESEND_API_KEY      — from https://resend.com/api-keys
 *   RESEND_AUDIENCE_ID   — from https://resend.com/audiences (create
 *                          an audience called e.g. "AI Universe
 *                          Subscribers" and copy its ID)
 *
 * Until both are set, this route responds with a clear 503 rather
 * than silently pretending to succeed — so a missing env var is
 * obvious in testing instead of quietly losing subscribers.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!apiKey || !audienceId) {
    console.error(
      "Newsletter signup received but RESEND_API_KEY / RESEND_AUDIENCE_ID is not configured."
    );
    return NextResponse.json(
      {
        error:
          "Newsletter signup is being finalized — please check back shortly, or email us directly in the meantime.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend audience signup failed:", response.status, detail);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
