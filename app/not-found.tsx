import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Section className="flex min-h-[70vh] items-center">
      <Container>
        <div className="mx-auto flex max-w-reading flex-col items-start gap-4">
          <span className="text-label uppercase text-text-tertiary">404</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            This page doesn&apos;t exist.
          </h1>
          <p className="text-body text-text-secondary">
            The page you&apos;re looking for may have been moved or never
            existed. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button href="/">Back to Home</Button>
            <Button href="/topics" variant="secondary">
              Explore Topics
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
