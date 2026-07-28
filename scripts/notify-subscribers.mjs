#!/usr/bin/env node
/**
 * Sends a "new article" or "new video" email to every newsletter
 * subscriber, via Resend's Broadcasts API against the same Audience
 * that app/api/newsletter/route.ts adds subscribers to.
 *
 * This is deliberately a command YOU run once after publishing,
 * rather than a fully automatic trigger — this project is a static
 * MDX site with no database or job scheduler watching the content
 * folder, so there's no reliable moment to auto-detect "a new article
 * just went live" without one. Running one command after `git push`
 * (or before it, doesn't matter) is the honest, simple equivalent.
 *
 * Usage:
 *   node scripts/notify-subscribers.mjs --topic how-transformers-actually-work
 *   node scripts/notify-subscribers.mjs --video how-transformers-actually-work
 *
 * Required environment variables (same as the newsletter/contact
 * forms — see .env.example):
 *   RESEND_API_KEY
 *   RESEND_AUDIENCE_ID
 *   RESEND_FROM
 *   NEXT_PUBLIC_SITE_URL (optional — defaults to lib/config.ts's fallback)
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const topicIndex = args.indexOf("--topic");
const videoIndex = args.indexOf("--video");

const apiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;
const fromAddress = process.env.RESEND_FROM;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiuniverse.com";

if (!apiKey || !audienceId || !fromAddress) {
  console.error(
    "Missing RESEND_API_KEY, RESEND_AUDIENCE_ID, or RESEND_FROM. Set these " +
      "in your shell or .env.local before running this script — see .env.example."
  );
  process.exit(1);
}

function readFrontmatterField(raw, field) {
  const match = raw.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match ? match[1].trim() : null;
}

let subject;
let previewText;
let ctaUrl;
let ctaLabel;

if (topicIndex !== -1) {
  const slug = args[topicIndex + 1];
  if (!slug) {
    console.error("Usage: node scripts/notify-subscribers.mjs --topic <slug>");
    process.exit(1);
  }
  const filePath = join(process.cwd(), "content", "topics", `${slug}.mdx`);
  if (!existsSync(filePath)) {
    console.error(`No article found at content/topics/${slug}.mdx`);
    process.exit(1);
  }
  const raw = readFileSync(filePath, "utf-8");
  const title = readFrontmatterField(raw, "title") ?? slug;
  const subtitle = readFrontmatterField(raw, "subtitle") ?? "";
  subject = `New on AI Universe: ${title}`;
  previewText = subtitle;
  ctaUrl = `${siteUrl}/topics/${slug}`;
  ctaLabel = "Read the article";
} else if (videoIndex !== -1) {
  const slug = args[videoIndex + 1];
  if (!slug) {
    console.error("Usage: node scripts/notify-subscribers.mjs --video <slug>");
    process.exit(1);
  }
  // lib/videos.ts is TypeScript — rather than transpiling it here, this
  // reads the registry as text for the one video entry we need. If you
  // restructure lib/videos.ts significantly, update this parser too.
  const raw = readFileSync(join(process.cwd(), "lib", "videos.ts"), "utf-8");
  const entryMatch = raw.match(
    new RegExp(`\\{[^{}]*slug:\\s*"${slug}"[^{}]*\\}`, "s")
  );
  if (!entryMatch) {
    console.error(`No video found with slug "${slug}" in lib/videos.ts`);
    process.exit(1);
  }
  const titleMatch = entryMatch[0].match(/title:\s*"([^"]+)"/);
  subject = `New video on AI Universe: ${titleMatch ? titleMatch[1] : slug}`;
  previewText = "A new video just went live.";
  ctaUrl = `${siteUrl}/videos`;
  ctaLabel = "Watch the video";
} else {
  console.error(
    "Usage:\n  node scripts/notify-subscribers.mjs --topic <slug>\n  node scripts/notify-subscribers.mjs --video <slug>"
  );
  process.exit(1);
}

const html = `
  <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
    <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8a99;">AI Universe</p>
    <h1 style="font-size: 22px; margin: 8px 0 12px;">${subject}</h1>
    ${previewText ? `<p style="font-size: 15px; color: #555; line-height: 1.6;">${previewText}</p>` : ""}
    <a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4C7DFF; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">${ctaLabel} →</a>
  </div>
`;

async function main() {
  console.log(`Creating broadcast: "${subject}"`);

  const createResponse = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audience_id: audienceId,
      from: fromAddress,
      subject,
      html,
    }),
  });

  if (!createResponse.ok) {
    console.error("Failed to create broadcast:", createResponse.status, await createResponse.text());
    process.exit(1);
  }

  const { id } = await createResponse.json();
  console.log(`Broadcast created (id: ${id}). Sending now…`);

  const sendResponse = await fetch(`https://api.resend.com/broadcasts/${id}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!sendResponse.ok) {
    console.error("Failed to send broadcast:", sendResponse.status, await sendResponse.text());
    process.exit(1);
  }

  console.log("✅ Sent to all subscribers.");
}

main();
