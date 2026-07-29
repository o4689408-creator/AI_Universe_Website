import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Newsletter subscription endpoint.
 *
 * Talks to Resend directly over fetch (no SDK — these are one or two
 * JSON POSTs, so adding the `resend` package would be an unnecessary
 * dependency). Requires environment variables set in Vercel Project
 * Settings -> Environment Variables (see .env.example):
 *
 *   RESEND_API_KEY      — from https://resend.com/api-keys
 *   RESEND_AUDIENCE_ID   — from https://resend.com/audiences (create
 *                          an audience called e.g. "AI Universe
 *                          Subscribers" and copy its ID)
 *   RESEND_FROM          — a sender Resend will accept, e.g.
 *                          "AI Universe <onboarding@resend.dev>" for
 *                          testing, or a verified domain address for
 *                          production. Used for the confirmation email
 *                          below; optional — if unset, the subscriber
 *                          is still added to the audience, they just
 *                          won't get a confirmation email.
 *
 * On success, this does two real things, not one: adds the address to
 * your Resend Audience (so scripts/notify-subscribers.mjs can reach
 * them later), AND sends an immediate confirmation email if
 * RESEND_FROM is set.
 *
 * If RESEND_API_KEY / RESEND_AUDIENCE_ID are missing entirely, this
 * can't pretend to save anything — there's nowhere to save it. It
 * returns `configured: false` (rather than a raw error) so the
 * frontend (sections/NewsletterSection.tsx) can show a graceful
 * "email us directly" fallback instead of a broken-looking error.
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
  const fromAddress = process.env.RESEND_FROM;

  if (!apiKey || !audienceId) {
    console.error(
      "Newsletter signup received but RESEND_API_KEY / RESEND_AUDIENCE_ID is not configured."
    );
    return NextResponse.json({ configured: false }, { status: 200 });
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

    // Confirmation email — best-effort. A failure here shouldn't turn
    // a successful subscription into an error response to the visitor;
    // they're already saved in the audience either way.
    if (fromAddress) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [email],
            subject: `You're subscribed to ${SITE_NAME}`,
            html: `<div style="font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
              <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8a8a99;">${SITE_NAME}</p>
              <h1 style="font-size:20px;margin:8px 0 12px;">You're on the list 🎉</h1>
              <p style="font-size:15px;color:#555;line-height:1.6;">Thanks for subscribing. You'll get an email whenever we publish a new deep-dive article or video — nothing else.</p>
            </div>`,
          }),
        });
      } catch (confirmationError) {
        console.error("Confirmation email failed to send:", confirmationError);
      }
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
