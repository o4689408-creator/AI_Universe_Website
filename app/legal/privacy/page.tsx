import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
  path: "/legal/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <Section className="pt-9">
      <Container>
        <div className="mx-auto flex max-w-reading flex-col gap-6">
          <span className="text-label uppercase text-accent">Legal</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Privacy Policy
          </h1>
          <p className="text-body-sm text-text-tertiary">
            Last updated: July 18, 2026
          </p>

          <div className="flex flex-col gap-5 text-body text-text-secondary">
            <p>
              This Privacy Policy explains what information {SITE_NAME}
              collects, how it&apos;s used, and the choices you have. This
              is a template and should be reviewed by a legal
              professional before publishing, to ensure it accurately
              reflects your data practices and complies with applicable
              law (e.g. GDPR, CCPA) in your jurisdiction.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Information we collect
            </h2>
            <p>
              <strong className="text-text-primary">
                Information you provide.
              </strong>{" "}
              If you subscribe to the newsletter or use the contact form,
              we collect the information you submit — typically your name
              and email address.
            </p>
            <p>
              <strong className="text-text-primary">
                Usage information.
              </strong>{" "}
              If analytics is enabled, we collect anonymized, aggregate
              usage data (such as which pages are viewed) through a
              privacy-friendly analytics provider that does not use
              cookies or track individuals across sites.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              How we use your information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To send the newsletter you&apos;ve subscribed to.</li>
              <li>To respond to messages sent through the contact form.</li>
              <li>To understand aggregate site usage and improve content.</li>
            </ul>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Third-party services
            </h2>
            <p>
              Articles embed videos from YouTube. When you choose to play
              an embedded video, YouTube (Google LLC) may collect data
              according to its own privacy policy. Videos are loaded only
              when you click to play them, not automatically.
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Your choices
            </h2>
            <p>
              You can unsubscribe from the newsletter at any time using
              the link included in every email. To request access to, or
              deletion of, your personal information, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>

            <h2 className="mt-2 text-heading-3 font-semibold text-text-primary">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Material
              changes will be reflected by updating the date at the top
              of this page.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
