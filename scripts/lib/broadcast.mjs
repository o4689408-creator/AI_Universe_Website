/**
 * Shared core used by both the manual CLI (scripts/notify-subscribers.mjs)
 * and the automatic CI trigger (scripts/notify-from-git-diff.mjs) — one
 * implementation of "build the email for this article/video and send
 * it as a Resend broadcast," so the two entry points can never drift
 * out of sync with each other.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromAddress = process.env.RESEND_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiuniverse.com";

  if (!apiKey || !audienceId || !fromAddress) {
    throw new Error(
      "Missing RESEND_API_KEY, RESEND_AUDIENCE_ID, or RESEND_FROM. Set these " +
        "as environment variables (locally in .env.local, or as GitHub Actions " +
        "repository secrets for the automatic workflow) — see .env.example."
    );
  }

  return { apiKey, audienceId, fromAddress, siteUrl };
}

function readFrontmatterField(raw, field) {
  const match = raw.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match ? match[1].trim() : null;
}

/** Reads title/subtitle from content/topics/<slug>.mdx frontmatter. */
export function readTopicInfo(slug) {
  const filePath = join(process.cwd(), "content", "topics", `${slug}.mdx`);
  if (!existsSync(filePath)) {
    throw new Error(`No article found at content/topics/${slug}.mdx`);
  }
  const raw = readFileSync(filePath, "utf-8");
  return {
    title: readFrontmatterField(raw, "title") ?? slug,
    subtitle: readFrontmatterField(raw, "subtitle") ?? "",
  };
}

/**
 * Reads a video's title out of lib/videos.ts by slug. This is
 * TypeScript, not JSON — rather than transpiling it, this parses the
 * one object literal we need as text. If lib/videos.ts's shape changes
 * significantly, update this parser (and extractVideoSlugs below) too.
 */
export function readVideoInfo(slug, rawVideosFile) {
  const raw = rawVideosFile ?? readFileSync(join(process.cwd(), "lib", "videos.ts"), "utf-8");
  const entryMatch = raw.match(new RegExp(`\\{[^{}]*slug:\\s*"${slug}"[^{}]*\\}`, "s"));
  if (!entryMatch) {
    throw new Error(`No video found with slug "${slug}" in lib/videos.ts`);
  }
  const titleMatch = entryMatch[0].match(/title:\s*"([^"]+)"/);
  return { title: titleMatch ? titleMatch[1] : slug };
}

/** Extracts every `slug: "..."` value from a lib/videos.ts source string. */
export function extractVideoSlugs(rawVideosFile) {
  const matches = [...rawVideosFile.matchAll(/slug:\s*"([^"]+)"/g)];
  return matches.map((match) => match[1]);
}

function emailTemplate({ subject, previewText, ctaUrl, ctaLabel }) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8a99;">AI Universe</p>
      <h1 style="font-size: 22px; margin: 8px 0 12px;">${subject}</h1>
      ${previewText ? `<p style="font-size: 15px; color: #555; line-height: 1.6;">${previewText}</p>` : ""}
      <a href="${ctaUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #4C7DFF; color: white; text-decoration: none; border-radius: 999px; font-weight: 600;">${ctaLabel} →</a>
    </div>
  `;
}

export function buildTopicBroadcast(slug, siteUrl) {
  const { title, subtitle } = readTopicInfo(slug);
  const subject = `New on AI Universe: ${title}`;
  return {
    subject,
    html: emailTemplate({
      subject,
      previewText: subtitle,
      ctaUrl: `${siteUrl}/topics/${slug}`,
      ctaLabel: "Read the article",
    }),
  };
}

export function buildVideoBroadcast(slug, siteUrl, rawVideosFile) {
  const { title } = readVideoInfo(slug, rawVideosFile);
  const subject = `New video on AI Universe: ${title}`;
  return {
    subject,
    html: emailTemplate({
      subject,
      previewText: "A new video just went live.",
      ctaUrl: `${siteUrl}/videos`,
      ctaLabel: "Watch the video",
    }),
  };
}

/** Creates a Resend broadcast for the given audience and sends it immediately. */
export async function sendBroadcast({ apiKey, audienceId, fromAddress, subject, html }) {
  console.log(`Creating broadcast: "${subject}"`);

  const createResponse = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ audience_id: audienceId, from: fromAddress, subject, html }),
  });

  if (!createResponse.ok) {
    throw new Error(
      `Failed to create broadcast: ${createResponse.status} ${await createResponse.text()}`
    );
  }

  const { id } = await createResponse.json();
  console.log(`Broadcast created (id: ${id}). Sending now…`);

  const sendResponse = await fetch(`https://api.resend.com/broadcasts/${id}/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!sendResponse.ok) {
    throw new Error(
      `Failed to send broadcast: ${sendResponse.status} ${await sendResponse.text()}`
    );
  }

  console.log("✅ Sent to all subscribers.");
}
