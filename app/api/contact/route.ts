import { NextResponse } from "next/server";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/config";
import { getDb, isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Contact form endpoint.
 *
 * STORAGE (required — the durable record of every submission):
 * MongoDB Atlas, via the official `mongodb` driver. Reads
 * MONGODB_URI from the environment — provided automatically once you
 * connect MongoDB Atlas to this Vercel project. Every submission is
 * inserted into the `contact_submissions` collection (name, email,
 * message, submittedAt), so nothing is lost even if email sending
 * below isn't configured or fails.
 *
 * EMAIL (optional, layered on top): if RESEND_API_KEY + RESEND_FROM
 * are also set, the message is also emailed to CONTACT_EMAIL
 * immediately via Resend, so you don't have to check the database to
 * notice a new message. Not required for the submission to be saved.
 *
 * If MONGODB_URI isn't configured at all, this returns `configured:
 * false` (rather than an error) — components/contact/ContactForm.tsx
 * then falls back to opening the visitor's own email app with the
 * message prefilled, so filling out the form is never a dead end.
 */
async function storeInMongo(entry: { name: string; email: string; message: string }): Promise<boolean> {
  if (!isMongoConfigured()) return false;

  try {
    const db = await getDb();
    await db.collection("contact_submissions").insertOne({
      ...entry,
      submittedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("MongoDB contact write failed:", error);
    return false;
  }
}

async function sendNotificationEmail(entry: { name: string; email: string; message: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM;
  if (!apiKey || !fromAddress) return;

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
        reply_to: entry.email,
        subject: `New message from ${entry.name} via ${SITE_NAME}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(entry.name)}</p><p><strong>Email:</strong> ${escapeHtml(entry.email)}</p><p><strong>Message:</strong></p><p>${escapeHtml(entry.message).replace(/\n/g, "<br/>")}</p>`,
      }),
    });
    if (!response.ok) {
      console.error("Resend contact notification failed:", response.status, await response.text());
    }
  } catch (error) {
    // Best-effort only — MongoDB (above) is the durable record; a
    // failed notification email never turns a successful, saved
    // submission into an error for the visitor.
    console.error("Contact notification email error:", error);
  }
}

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

  try {
    const entry = { name, email, message };
    const storedInMongo = await storeInMongo(entry);

    if (!storedInMongo) {
      console.error("Contact form received but MONGODB_URI is not configured.");
      return NextResponse.json({ configured: false }, { status: 200 });
    }

    // Not awaited, same reasoning as app/api/newsletter/route.ts: the
    // submission is safely durable the moment MongoDB confirms the
    // write above, so there's no reason to make the visitor wait on
    // an optional notification email too. sendNotificationEmail
    // already catches its own errors and never throws; `.catch()`
    // here is only a safety net against an unexpected synchronous
    // throw.
    sendNotificationEmail(entry).catch((error) => {
      console.error("Contact notification email task failed:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
