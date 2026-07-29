#!/usr/bin/env node
/**
 * Automatic newsletter trigger — run by
 * .github/workflows/notify-subscribers.yml on every push to `main`.
 *
 * How it decides what's "new": it diffs the two commit SHAs GitHub
 * Actions provides for the push (BEFORE_SHA -> AFTER_SHA, from
 * `github.event.before` / `github.event.after`) and looks for:
 *   - Newly ADDED files under content/topics/*.mdx  -> new article
 *   - Slugs present in the new lib/videos.ts but not the old one
 *     -> new video
 *
 * This needs zero database, zero CMS, and zero extra account beyond
 * the Resend credentials the newsletter/contact forms already use —
 * git history IS the record of "what's new," which is exactly what a
 * static MDX site already has lying around for free. It runs
 * automatically on every push that touches those paths; nobody has to
 * remember to run a command.
 *
 * Required environment variables (set as GitHub Actions repository
 * secrets — see the workflow file and OWNER_MANUAL.md):
 *   RESEND_API_KEY, RESEND_AUDIENCE_ID, RESEND_FROM
 *   NEXT_PUBLIC_SITE_URL (optional)
 * Provided automatically by the workflow (not secrets):
 *   BEFORE_SHA, AFTER_SHA
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  getResendConfig,
  buildTopicBroadcast,
  buildVideoBroadcast,
  extractVideoSlugs,
  sendBroadcast,
} from "./lib/broadcast.mjs";

const ZERO_SHA = "0000000000000000000000000000000000000000";
const beforeSha = process.env.BEFORE_SHA;
const afterSha = process.env.AFTER_SHA ?? "HEAD";

function git(command) {
  return execSync(command, { encoding: "utf-8" }).trim();
}

async function main() {
  if (!beforeSha || beforeSha === ZERO_SHA) {
    // First push of a new branch, or a force-push GitHub can't diff
    // cleanly — there's no safe "before" state to compare against, so
    // rather than guessing (and risking notifying subscribers about
    // every existing article at once), this run is a no-op. Use
    // `npm run notify -- --topic <slug>` manually for a one-off catch-up.
    console.log(
      "No usable BEFORE_SHA (new branch or force-push) — skipping automatic diff. " +
        "Use `npm run notify` manually if you need to send for a specific item."
    );
    return;
  }

  const config = getResendConfig();

  const changedFiles = git(`git diff --name-status ${beforeSha} ${afterSha}`)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...pathParts] = line.split("\t");
      return { status, path: pathParts.join("\t") };
    });

  const newTopicSlugs = changedFiles
    .filter(
      (file) =>
        file.status === "A" &&
        file.path.startsWith("content/topics/") &&
        file.path.endsWith(".mdx")
    )
    .map((file) => file.path.replace("content/topics/", "").replace(/\.mdx$/, ""));

  let newVideoSlugs = [];
  const videosFileChanged = changedFiles.some((file) => file.path === "lib/videos.ts");
  if (videosFileChanged) {
    const currentVideosRaw = readFileSync("lib/videos.ts", "utf-8");
    let previousVideosRaw = "";
    try {
      previousVideosRaw = git(`git show ${beforeSha}:lib/videos.ts`);
    } catch {
      // lib/videos.ts didn't exist at beforeSha (e.g. it's brand new) —
      // treat every current slug as new.
      previousVideosRaw = "";
    }
    const previousSlugs = new Set(extractVideoSlugs(previousVideosRaw));
    const currentSlugs = extractVideoSlugs(currentVideosRaw);
    newVideoSlugs = currentSlugs.filter((slug) => !previousSlugs.has(slug));
  }

  if (newTopicSlugs.length === 0 && newVideoSlugs.length === 0) {
    console.log("No new articles or videos in this push — nothing to send.");
    return;
  }

  console.log(
    `Found ${newTopicSlugs.length} new article(s) and ${newVideoSlugs.length} new video(s).`
  );

  const results = { sent: [], failed: [] };

  for (const slug of newTopicSlugs) {
    try {
      const broadcast = buildTopicBroadcast(slug, config.siteUrl);
      await sendBroadcast({ ...config, ...broadcast });
      results.sent.push(`topic:${slug}`);
    } catch (error) {
      console.error(`Failed to notify for topic "${slug}":`, error.message);
      results.failed.push(`topic:${slug}`);
    }
  }

  for (const slug of newVideoSlugs) {
    try {
      const currentVideosRaw = readFileSync("lib/videos.ts", "utf-8");
      const broadcast = buildVideoBroadcast(slug, config.siteUrl, currentVideosRaw);
      await sendBroadcast({ ...config, ...broadcast });
      results.sent.push(`video:${slug}`);
    } catch (error) {
      console.error(`Failed to notify for video "${slug}":`, error.message);
      results.failed.push(`video:${slug}`);
    }
  }

  console.log(`Done. Sent: ${results.sent.join(", ") || "none"}.`);
  if (results.failed.length > 0) {
    console.error(`Failed: ${results.failed.join(", ")}.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
