import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { FollowLinks } from "@/components/layout/FollowLinks";
import { GmailButton } from "@/components/contact/GmailButton";
import { FooterNewsletterForm } from "@/components/contact/FooterNewsletterForm";
import { SITE_DESCRIPTION, CONTACT_EMAIL } from "@/lib/config";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Topics", href: "/topics" },
  { label: "Videos", href: "/videos" },
  { label: "Explore Your AI Journey", href: "/#explore-your-ai-journey" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Your Library", href: "/library" },
];

const legalLinks = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];

/**
 * Premium footer: brand + social + Gmail CTA, three quick-link
 * columns, and an inline newsletter form — all in one final band so
 * a visitor who scrolls to the bottom of any page always has a path
 * to subscribe, reach out, or keep exploring. AnimatedReveal is
 * skipped here deliberately (unlike section-level reveals elsewhere)
 * since the footer is rarely the first thing in the viewport and a
 * fade-in on a "utility" region can read as a delay rather than polish.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border-subtle">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        aria-hidden="true"
      />
      <Container>
        <div className="grid grid-cols-1 gap-10 py-9 md:grid-cols-[1.3fr_0.8fr_0.8fr_1.1fr] md:gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-sm text-body-sm text-text-secondary">
              {SITE_DESCRIPTION.split(" — ")[0] ?? SITE_DESCRIPTION}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <FollowLinks />
            </div>
            <div className="mt-2 flex flex-col gap-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="w-fit text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary"
              >
                {CONTACT_EMAIL}
              </a>
              <GmailButton variant="compact" />
            </div>
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Company" links={[...companyLinks, ...legalLinks]} />

          <div className="flex flex-col gap-3">
            <span className="text-label uppercase text-text-tertiary">
              Stay updated
            </span>
            <p className="text-body-sm text-text-secondary">
              One email when a new deep-dive goes live. No noise, no spam.
            </p>
            <FooterNewsletterForm />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border-subtle py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-sm text-text-tertiary">
            © {year} AI Universe. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-sm text-text-tertiary transition-colors duration-fast hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-label uppercase text-text-tertiary">{title}</span>
      <nav className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group relative w-fit text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary"
          >
            {link.label}
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-accent transition-all duration-base ease-out group-hover:w-full" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
