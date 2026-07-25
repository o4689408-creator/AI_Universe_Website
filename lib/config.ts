/**
 * Site-wide configuration constants.
 *
 * SITE_URL reads from the environment so the same build works correctly
 * on Vercel preview deployments, a staging domain, and production
 * without code changes — set NEXT_PUBLIC_SITE_URL in the Vercel project
 * settings (see .env.example). Falls back to the production domain so
 * local builds and metadata generation never break if it's unset.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiuniverse.com";

export const SITE_NAME = "AI Universe";

export const SITE_DESCRIPTION =
  "A premium knowledge platform for understanding artificial intelligence — deep research, clear explanations, and documentary-style storytelling.";

export const YOUTUBE_CHANNEL_URL = "https://youtube.com";

/**
 * "Follow us" destinations — your own social profiles, distinct from
 * the article-share intents in ShareButtons.tsx (which share THIS
 * article, not link to your profile). Replace with your real URLs;
 * see OWNER_MANUAL.md for the full walkthrough.
 */
export const INSTAGRAM_URL = "https://instagram.com/aiuniverse";
export const FACEBOOK_URL = "https://facebook.com/aiuniverse";
export const LINKEDIN_URL = "https://linkedin.com/company/aiuniverse";
export const WHATSAPP_URL = "https://wa.me/10000000000";

export const CONTACT_EMAIL = "hello@aiuniverse.com";
