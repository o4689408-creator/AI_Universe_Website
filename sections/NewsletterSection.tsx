"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Purpose: convert one-time visitors into a retainable audience — the
 * highest-leverage growth mechanic for a small site publishing
 * infrequently. Layout: centered band, contrasting surface background,
 * inline form on desktop, stacked on mobile. No modal, no confetti —
 * the success state fades in calmly in place.
 *
 * Note: this wires up client-side validation and local state only.
 * Connecting a real provider (e.g. ConvertKit/Resend) is a follow-up
 * step — the form action is isolated in handleSubmit specifically so
 * that wiring is a one-function change.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    // Placeholder for the real newsletter provider integration.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setStatus("success");
  }

  return (
    <Section id="newsletter" background="surface-1" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[120px]"
        aria-hidden="true"
      />
      <Container>
        <AnimatedReveal className="mx-auto flex max-w-reading flex-col items-center gap-5 text-center">
          <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
            Get the next deep-dive before anyone else.
          </h2>
          <p className="text-body text-text-secondary">
            One email when a new topic goes live. No noise, no spam.
          </p>

          {status === "success" ? (
            <p
              role="status"
              className="text-body text-accent"
            >
              You&apos;re on the list — thanks for subscribing.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={status === "error"}
                aria-describedby={
                  status === "error" ? "newsletter-error" : undefined
                }
                className="flex-1 rounded-md border border-border bg-bg-base px-4 py-3 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
              />
              <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          )}

          {status === "error" && error && (
            <p id="newsletter-error" role="alert" className="text-body-sm text-error">
              {error}
            </p>
          )}
        </AnimatedReveal>
      </Container>
    </Section>
  );
}
