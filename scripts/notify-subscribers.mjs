#!/usr/bin/env node
/**
 * Manually send a "new article" or "new video" email to every
 * subscriber, right now, for one specific slug.
 *
 * This is a manual override/backfill tool — the primary, automatic
 * path is .github/workflows/notify-subscribers.yml (see
 * scripts/notify-from-git-diff.mjs), which runs on every push to
 * `main` that touches content/topics/** or lib/videos.ts and figures
 * out what's new by itself. Use this script only if you need to
 * resend for something the automatic workflow already handled, or
 * you're publishing through a path that doesn't go through git push.
 *
 * Usage:
 *   node scripts/notify-subscribers.mjs --topic how-transformers-actually-work
 *   node scripts/notify-subscribers.mjs --video how-transformers-actually-work
 *
 * Required environment variables — see .env.example:
 *   RESEND_API_KEY, RESEND_AUDIENCE_ID, RESEND_FROM
 *   NEXT_PUBLIC_SITE_URL (optional)
 */

import {
  getResendConfig,
  buildTopicBroadcast,
  buildVideoBroadcast,
  sendBroadcast,
} from "./lib/broadcast.mjs";

const args = process.argv.slice(2);
const topicIndex = args.indexOf("--topic");
const videoIndex = args.indexOf("--video");

let config;
try {
  config = getResendConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

async function main() {
  let broadcast;

  if (topicIndex !== -1) {
    const slug = args[topicIndex + 1];
    if (!slug) throw new Error("Usage: node scripts/notify-subscribers.mjs --topic <slug>");
    broadcast = buildTopicBroadcast(slug, config.siteUrl);
  } else if (videoIndex !== -1) {
    const slug = args[videoIndex + 1];
    if (!slug) throw new Error("Usage: node scripts/notify-subscribers.mjs --video <slug>");
    broadcast = buildVideoBroadcast(slug, config.siteUrl);
  } else {
    throw new Error(
      "Usage:\n  node scripts/notify-subscribers.mjs --topic <slug>\n  node scripts/notify-subscribers.mjs --video <slug>"
    );
  }

  await sendBroadcast({ ...config, ...broadcast });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
