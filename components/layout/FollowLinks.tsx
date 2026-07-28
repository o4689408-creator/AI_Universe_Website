import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  WHATSAPP_DEFAULT_MESSAGE,
  X_URL,
  YOUTUBE_CHANNEL_URL,
  buildWhatsAppLink,
} from "@/lib/config";

const links = [
  { label: "YouTube", href: YOUTUBE_CHANNEL_URL, icon: YouTubeIcon },
  { label: "X", href: X_URL, icon: XIcon },
  { label: "Instagram", href: INSTAGRAM_URL, icon: InstagramIcon },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: LinkedInIcon },
  { label: "Facebook", href: FACEBOOK_URL, icon: FacebookIcon },
  { label: "WhatsApp", href: buildWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE), icon: WhatsAppIcon },
];

export function FollowLinks() {
  return (
    <div className="flex items-center gap-3">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow on ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle text-text-tertiary transition-colors duration-fast hover:border-border hover:text-text-primary"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.5 6.8 14.2 1.5h-1.6L8.8 5.7 5.6 1.5H1.6l4.9 6.7-4.9 6.3h1.6l4-4.4 3.4 4.4h4l-5.1-7Zm-1.4 1.6-.5-.6-3.7-5h1.4l3 4 .5.6 3.9 5.3H11.3l-3.2-4.3Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14.5 4.8a2 2 0 0 0-1.4-1.4C11.9 3 8 3 8 3s-3.9 0-5.1.4A2 2 0 0 0 1.5 4.8 20 20 0 0 0 1 8a20 20 0 0 0 .5 3.2 2 2 0 0 0 1.4 1.4C4.1 13 8 13 8 13s3.9 0 5.1-.4a2 2 0 0 0 1.4-1.4A20 20 0 0 0 15 8a20 20 0 0 0-.5-3.2ZM6.5 10.3V5.7L10.5 8Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11.3" cy="4.7" r="0.7" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.6 5.6h2.3V13H3.6V5.6ZM4.75 2.5a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7ZM7.4 5.6h2.2v1h.03c.3-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.52V13h-2.3V9.35c0-.87-.02-2-1.22-2s-1.4.95-1.4 1.93V13H7.4V5.6Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M9.5 4.8h1.7V2.1h-1.9C7.6 2.1 6.5 3.3 6.5 5v1.6H5v2.6h1.5V14h2.6V9.2h1.7l.4-2.6H9.1V5.3c0-.3.2-.5.4-.5Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2a6 6 0 0 0-5.2 9L2 14l3.1-.8A6 6 0 1 0 8 2Zm0 1.2a4.8 4.8 0 0 1 4 7.4l-.2.3.5 1.8-1.9-.5-.3.2A4.8 4.8 0 1 1 8 3.2Z" />
    </svg>
  );
}
