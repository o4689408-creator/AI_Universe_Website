import { NextResponse } from "next/server";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/config";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Contact form endpoint — sends the message to CONTACT_EMAIL
 * (lib/config.ts) via Resend's transactional email API over fetch
 * (no SDK; same reasoning as app/api/newsletter/route.ts).
 *
 * Requires, in Vercel Project Settings -> Environment Variables:
 *   RESEND_API_KEY   — from https://resend.com/api-keys
 *   RESEND_FROM      — a verified sender, e.g.
 *                      "AI Universe <hello@yourdomain.com>". Until a
 *                      domain is verified in Resend, you can use
 *                      "AI Universe <onboarding@resend.dev>" for testing.
 */
export async function POST(request: Request) {
  let payload: { name?: unknown; email?: unknown; message?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || !message) {
    return NextResponse.json(
      { error: "Please fill in your name and message." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;

  if (!apiKey || !fromAddress) {
    console.error("Contact form received but RESEND_API_KEY / RESEND_FROM is not configured.");
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `New message from ${name} via ${SITE_NAME}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend contact email failed:", response.status, detail);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
