import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: `The terms governing your use of ${SITE_NAME}.`,
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <Section className="pt-9">
      <Container>
        <div className="mx-auto flex max-w-reading flex-col gap-6">
          <span className="text-label uppercase text-accent">Legal</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Terms of Use
          </h1>
          <p className="text-body-sm text-text-tertiary">
            Last updated: July 18, 2026
          </p>

          <div className="flex flex-col gap-5 text-body text-text-secondary">
            <p>
              These Terms of Use govern your access to and use of{" "}
              {SITE_NAME}. This is a template and should be reviewed by a
              legal professional before publishing. By using this site,
              you agree to these terms.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Content
            </h2>
            <p>
              All articles, diagrams, and other content on this site are
              provided for informational and educational purposes. While
              we take care to research and source content accurately, AI
              is a fast-moving field — we make no warranty that content
              remains complete or current after publication, and articles
              are dated to reflect when they were last reviewed.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Intellectual property
            </h2>
            <p>
              Unless otherwise noted, content on this site is owned by{" "}
              {SITE_NAME}. You may share links to our content freely;
              please contact us before reproducing substantial portions
              of an article elsewhere.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Third-party links and embeds
            </h2>
            <p>
              This site links to and embeds content from YouTube. We
              aren&apos;t responsible for the content or practices of
              third-party sites linked from our articles.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Limitation of liability
            </h2>
            <p>
              {SITE_NAME} is provided &ldquo;as is&rdquo; without
              warranties of any kind. To the fullest extent permitted by
              law, {SITE_NAME} is not liable for any damages arising from
              your use of, or inability to use, this site.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Contact
            </h2>
            <p>
              Questions about these terms can be sent to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
