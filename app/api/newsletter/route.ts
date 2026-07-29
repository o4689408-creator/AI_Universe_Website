import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/config";

export const runtime = "nodejs";

/**
 * Newsletter subscription endpoint.
 *
 * STORAGE (required for a real, persistent subscriber list):
 * Vercel KV — a Redis database that's a first-party Vercel add-on, not
 * a separate external account. Enable it once in your Vercel project
 * dashboard ("Storage" tab -> Create Database -> KV) and Vercel
 * injects KV_REST_API_URL / KV_REST_API_TOKEN automatically; nothing
 * to add to code or .env. This talks to it over plain fetch against
 * Upstash's REST API (what Vercel KV runs on) — no SDK dependency.
 *
 * EMAIL (optional, layered on top): if RESEND_API_KEY + RESEND_FROM
 * are also set, a confirmation email is sent immediately. If
 * RESEND_AUDIENCE_ID is *also* set, the subscriber is mirrored into
 * that Resend Audience too — Vercel KV is the durable source of truth
 * for "who's subscribed," while the Resend Audience mirror is what
 * scripts/notify-from-git-diff.mjs actually sends broadcasts against.
 * None of this is required for signup itself to work — see
 * .env.example for all of it.
 *
 * If KV isn't configured yet, the subscription is still accepted (the
 * visitor is never shown a "not configured" message) and the address
 * is logged to the server's function logs as a stopgap so nothing is
 * silently lost — but this is genuinely a fallback, not a substitute
 * for enabling KV. See OWNER_MANUAL.md for the two-minute setup.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function storeInKv(email: string): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;

  const response = await fetch(`${KV_URL}/sadd/newsletter:subscribers/${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });

  if (!response.ok) {
    console.error("Vercel KV write failed:", response.status, await response.text());
    return false;
  }
  return true;
}

async function addToResendAudience(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return;

  try {
    const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!response.ok) {
      console.error("Resend audience mirror failed:", response.status, await response.text());
    }
  } catch (error) {
    // Best-effort — KV (above) is the source of truth for "is this
    // person subscribed"; this mirror only matters for
    // scripts/notify-from-git-diff.mjs being able to reach them later.
    console.error("Resend audience mirror error:", error);
  }
}

async function sendConfirmationEmail(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  if (!apiKey || !fromAddress) return;

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
          <h1 style="font-size:20px;margin:8px 0 12px;">Welcome to the AI Universe community 🎉</h1>
          <p style="font-size:15px;color:#555;line-height:1.6;">You're officially in. Expect an email whenever we publish a new deep-dive article or video — nothing else.</p>
        </div>`,
      }),
    });
  } catch (error) {
    // Best-effort only — a failed confirmation email never turns a
    // successful subscription into an error for the visitor.
    console.error("Confirmation email failed to send:", error);
  }
}

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

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const storedInKv = await storeInKv(normalizedEmail);
    if (!storedInKv) {
      // Stopgap only — see file doc comment. Grep your Vercel function
      // logs for "NEWSLETTER_SIGNUP" if KV isn't set up yet.
      console.log(`NEWSLETTER_SIGNUP (KV not configured): ${normalizedEmail}`);
    }

    await Promise.all([addToResendAudience(normalizedEmail), sendConfirmationEmail(normalizedEmail)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
