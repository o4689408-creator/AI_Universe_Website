"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Section className="flex min-h-[70vh] items-center">
      <Container>
        <div className="mx-auto flex max-w-reading flex-col items-start gap-4">
          <span className="text-label uppercase text-error">Error</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Something went wrong.
          </h1>
          <p className="text-body text-text-secondary">
            An unexpected error occurred while loading this page. You can
            try again, or head back to the homepage.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={reset}>Try again</Button>
            <Button href="/" variant="secondary">
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
