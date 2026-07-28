import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
import { GmailButton } from "@/components/contact/GmailButton";
import { PageAmbientBackground } from "@/components/ui/PageAmbientBackground";
import { CONTACT_EMAIL } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description: "Get in touch with AI Universe.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Section className="relative pt-9">
      <PageAmbientBackground variant="contact" />
      <Container>
        <div className="mx-auto flex max-w-reading flex-col gap-6">
          <span className="text-label uppercase text-accent">Contact</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Get in touch.
          </h1>
          <p className="text-body text-text-secondary">
            Questions, corrections, or collaboration ideas — send a
            message below, or email us directly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <div className="mt-2">
            <GmailButton variant="cta" />
          </div>

          <div className="mt-4 flex items-center gap-4 text-body-sm text-text-tertiary">
            <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
            or send a message
            <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
