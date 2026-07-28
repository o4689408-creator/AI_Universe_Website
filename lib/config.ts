/**
 * Site-wide configuration — the SINGLE place to update brand, contact,
 * and social details before/after launch.
 *
 * Every component that shows the site name, a social link, the
 * YouTube channel, WhatsApp, or the contact email reads it from here —
 * never hardcoded inline. Update a value once, it's correct everywhere
 * (header, footer, article share bar, WhatsApp button, JSON-LD, etc).
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
 * WhatsApp number in international format, digits only, no "+" and no
 * spaces (e.g. "919876543210" for an Indian number). Replace this
 * before launch — the WhatsApp button and "follow us" link are both
 * derived from it and won't open a real chat until a real number is
 * set here.
 */
export const WHATSAPP_NUMBER = "10000000000";

/**
 * The default greeting used by the premium WhatsApp contact button
 * (components/contact/WhatsAppButton.tsx). The current page URL is
 * appended automatically at click time, so the team always knows
 * which page the visitor reached out from.
 */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello AI Universe Team! I discovered your website and would like to know more.";

/** Plain wa.me link with no prefilled text — used for simple "follow us" links. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** Builds a wa.me deep link with a prefilled, URL-encoded message. */
export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Social — "follow us" destinations, distinct from the article-share
// intents in ShareButtons.tsx (which share THIS article, not link to
// your profile). Replace with your real URLs; see OWNER_MANUAL.md.
// ---------------------------------------------------------------------------

export const INSTAGRAM_URL = "https://instagram.com/aiuniverse";
export const FACEBOOK_URL = "https://facebook.com/aiuniverse";
export const LINKEDIN_URL = "https://linkedin.com/company/aiuniverse";
export const X_URL = "https://x.com/aiuniverse";
