import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FollowLinks } from "@/components/layout/FollowLinks";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";

const exploreLinks = [
  { label: "Topics", href: "/topics" },
  { label: "Videos", href: "/videos" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-9 md:grid-cols-4 md:gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-heading-4 font-semibold text-text-primary">
              {SITE_NAME}
            </span>
            <p className="text-body-sm text-text-secondary">
              {SITE_DESCRIPTION.split(" — ")[0] ?? SITE_DESCRIPTION}
            </p>
            <div className="mt-1">
              <FollowLinks />
            </div>
          </div>

          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Legal" links={legalLinks} />

          <div className="flex flex-col gap-3">
            <span className="text-label uppercase text-text-tertiary">
              Stay updated
            </span>
            <Link
              href="/#newsletter"
              className="text-body-sm text-accent hover:text-accent-hover"
            >
              Subscribe to the newsletter →
            </Link>
            <Link
              href="/rss.xml"
              className="text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary"
            >
              RSS feed
            </Link>
          </div>
        </div>

        <div className="border-t border-border-subtle py-4">
          <p className="text-body-sm text-text-tertiary">
            © {year} {SITE_NAME}. All rights reserved.
          </p>
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
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-body-sm text-text-secondary transition-colors duration-fast hover:text-text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
