/**
 * Site-wide configuration — the SINGLE place to update brand, contact,
 * and social details before/after launch.
 *
 * Every component that shows the site name, a social link, the
 * YouTube channel, or the contact email reads it from here — never
 * hardcoded inline. Update a value once, it's correct everywhere
 * (header, footer, article share bar, Gmail button, JSON-LD, etc).
 *
 * SITE_URL reads from the environment so the same build works
 * correctly on Vercel preview deployments, a staging domain, and
 * production without code changes — set NEXT_PUBLIC_SITE_URL in the
 * Vercel project settings (see .env.example). Falls back to the
 * production domain so local builds and metadata generation never
 * break if it's unset.
 */

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

export const SITE_NAME = "AI Universe";

/** Used as the logo wordmark and in the browser tab title template. */
export const SITE_LOGO_TEXT = SITE_NAME;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiuniverse.com";

// ---------------------------------------------------------------------------
// SEO defaults
// ---------------------------------------------------------------------------

export const SITE_DESCRIPTION =
  "A premium knowledge platform for understanding artificial intelligence — deep research, clear explanations, and documentary-style storytelling.";

export const SITE_TAGLINE = "Understand Artificial Intelligence, Deeply";

export const SEO_DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const SEO_DEFAULT_OG_LOCALE = "en_US";

// ---------------------------------------------------------------------------
// Channels & contact
// ---------------------------------------------------------------------------

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@ZynthicTech_AI";

export const CONTACT_EMAIL = "storysphere173@gmail.com";

/**
 * The default subject/body used by the premium Gmail contact button
 * (components/contact/GmailButton.tsx). Opens the visitor's default
 * mail client via a `mailto:` link — no external service, no API key,
 * works everywhere.
 */
export const GMAIL_DEFAULT_SUBJECT = "AI Universe Inquiry";

export const GMAIL_DEFAULT_BODY =
  "Hello AI Universe Team,\n\nI discovered your website and would like to know more.\n\nThank you.";

/** Builds a `mailto:` link with a prefilled subject and body. */
export function buildMailtoLink(
  to: string = CONTACT_EMAIL,
  subject: string = GMAIL_DEFAULT_SUBJECT,
  body: string = GMAIL_DEFAULT_BODY
): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---------------------------------------------------------------------------
// Social — "follow us" destinations, distinct from the article-share
// intents in ShareButtons.tsx (which share THIS article, not link to
// your profile). Replace with your real URLs; see OWNER_MANUAL.md.
// ---------------------------------------------------------------------------

export const INSTAGRAM_URL = "https://www.instagram.com/zynthictech_07?igsh=YnpjYzRhem52cmt2";
export const LINKEDIN_URL = "https://linkedin.com/company/aiuniverse";
export const X_URL = "https://x.com/aiuniverse";
