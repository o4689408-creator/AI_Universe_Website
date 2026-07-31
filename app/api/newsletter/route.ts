import { NextResponse } from "next/server";
import { SITE_NAME } from "@/lib/config";
import { getDb, isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";

/**
 * Newsletter subscription endpoint.
 *
 * STORAGE (required for a real, persistent subscriber list): MongoDB
 * Atlas, via the official `mongodb` driver. Reads MONGODB_URI from the
 * environment — provided automatically once you connect MongoDB
 * Atlas to this Vercel project (Vercel project -> Storage/Integrations
 * -> MongoDB Atlas). Subscribers are upserted into the
 * `newsletter_subscribers` collection by email (so re-subscribing
 * never creates a duplicate), with a unique index on `email` created
 * lazily on first write.
 *
 * EMAIL (optional, layered on top): if RESEND_API_KEY + RESEND_FROM
 * are also set, a confirmation email is sent immediately. If
 * RESEND_AUDIENCE_ID is *also* set, the subscriber is mirrored into
 * that Resend Audience too — MongoDB is the durable source of truth
 * for "who's subscribed," while the Resend Audience mirror is what
 * scripts/notify-from-git-diff.mjs actually sends broadcasts against.
 * None of this is required for signup itself to work — see
 * .env.example for all of it.
 *
 * If MONGODB_URI isn't configured yet, the subscription is still
 * accepted (the visitor is never shown a "not configured" message)
 * and the address is logged to the server's function logs as a
 * stopgap so nothing is silently lost — but this is genuinely a
 * fallback, not a substitute for connecting MongoDB Atlas.
 */

// Ensures the unique index exists exactly once per warm serverless
// instance, not on every request — createIndex is idempotent, but it
// still costs a real round-trip to Atlas, and doing that on every
// single signup was adding needless latency to every request.
let indexEnsured = false;

async function storeInMongo(email: string): Promise<boolean> {
  if (!isMongoConfigured()) return false;

  try {
    const db = await getDb();
    const collection = db.collection("newsletter_subscribers");

    if (!indexEnsured) {
      await collection.createIndex({ email: 1 }, { unique: true });
      indexEnsured = true;
    }

    await collection.updateOne(
      { email },
      {
        $setOnInsert: { email, subscribedAt: new Date() },
        $set: { unsubscribed: false },
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("MongoDB newsletter write failed:", error);
    return false;
  }
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
    // Best-effort — MongoDB (above) is the source of truth for "is
    // this person subscribed"; this mirror only matters for
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
    const storedInMongo = await storeInMongo(normalizedEmail);
    if (!storedInMongo) {
      // Stopgap only — see file doc comment. Grep your Vercel function
      // logs for "NEWSLETTER_SIGNUP" if MongoDB isn't set up yet.
      console.log(`NEWSLETTER_SIGNUP (MongoDB not configured): ${normalizedEmail}`);
    }

    // Deliberately NOT awaited. The visitor is subscribed the moment
    // MongoDB confirms the write above — a confirmation email is a
    // nice-to-have, not something worth making them wait ~1-2 extra
    // network round-trips for. Both functions already catch their own
    // errors internally and never throw, so this can't reject; the
    // `.catch()` here is only a safety net against an unexpected
    // synchronous throw, to guarantee this never surfaces as an
    // unhandled promise rejection in the function logs.
    //
    // Caveat worth knowing: on serverless platforms (Vercel), work
    // kicked off after the response is returned is "best effort" — the
    // platform generally keeps the instance alive long enough to
    // finish a single quick fetch, but it isn't a hard guarantee the
    // way `await` is. That trade-off is intentional here: an
    // optional confirmation email arriving a little late (or, in a
    // rare worst case, not at all) is a fully acceptable cost for
    // making every signup feel instant, especially since MongoDB
    // (the actual subscriber record) is never at risk either way.
    Promise.all([
      addToResendAudience(normalizedEmail),
      sendConfirmationEmail(normalizedEmail),
    ]).catch((error) => {
      console.error("Newsletter background email tasks failed:", error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
