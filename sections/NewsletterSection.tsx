"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { GmailButton } from "@/components/contact/GmailButton";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";

type Status = "idle" | "submitting" | "success" | "error" | "not-configured";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Purpose: convert one-time visitors into a retainable audience — the
 * highest-leverage growth mechanic for a small site publishing
 * infrequently.
 *
 * Layout: a self-contained card (not just a flat colored band) with a
 * gradient border-glow, an icon badge, and a form that's genuinely
 * legible and easy to tap at every width — full-bleed stacked on
 * phones, inline on tablet/desktop.
 *
 * Posts to app/api/newsletter/route.ts, which adds the address to a
 * Resend Audience and sends a confirmation email. If Resend isn't
 * configured yet (no RESEND_API_KEY / RESEND_AUDIENCE_ID set), the
 * route can't invent a place to save the address — rather than
 * showing an error, this falls back to a direct "email us" prompt, so
 * a visitor is never met with a dead end either way.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const handleRipple = useRipple();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        configured?: boolean;
      };

      if (data.configured === false) {
        setStatus("not-configured");
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <Section id="newsletter" background="base" className="relative">
      <Container>
        <AnimatedReveal>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface-1 px-5 py-10 shadow-lg sm:px-10 sm:py-14">
            {/* Restrained ambient glow — a single soft radial bloom,
                not a full gradient background, to stay within the
                site's "one gradient, used sparingly" design language. */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/[0.14] blur-[110px]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
              aria-hidden="true"
            />

            <div className="relative flex flex-col items-center gap-5 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-muted text-accent">
                <MailIcon />
              </span>

              <div className="flex flex-col gap-2.5">
                <h2 className="text-balance text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
                  Get the next deep-dive before anyone else.
                </h2>
                <p className="text-balance text-body text-text-secondary">
                  One email when a new topic goes live. No noise, no spam —
                  unsubscribe anytime.
                </p>
              </div>

              {status === "success" && (
                <div
                  role="status"
                  className="flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent-muted px-5 py-3 text-body font-medium text-accent animate-fade-up"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-bg-base">
                    <CheckIcon />
                  </span>
                  You&apos;re on the list — check your inbox for confirmation.
                </div>
              )}

              {status === "not-configured" && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border-subtle bg-bg-surface-2 px-5 py-4 animate-fade-up">
                  <p className="text-body-sm text-text-secondary">
                    Signup is being finalized — email us directly and we&apos;ll add you personally.
                  </p>
                  <GmailButton variant="compact" />
                </div>
              )}

              {(status === "idle" ||
                status === "submitting" ||
                status === "error") && (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-1 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:gap-2.5"
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
                    aria-describedby={status === "error" ? "newsletter-error" : undefined}
                    className="min-h-[52px] flex-1 rounded-full border border-border bg-bg-base px-5 text-body text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    onPointerDown={handleRipple}
                    className={cn(
                      "relative min-h-[52px] shrink-0 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-br from-accent to-accent-hover px-7 text-body font-semibold text-bg-base shadow-glow-accent",
                      "transition-transform duration-base ease-out hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
                    )}
                  >
                    {status === "submitting" ? "Subscribing…" : "Subscribe"}
                  </button>
                </form>
              )}

              {status === "error" && error && (
                <p id="newsletter-error" role="alert" className="text-body-sm text-error">
                  {error}
                </p>
              )}
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3.5 6 10 11 16.5 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 9.2 7.2 12.5 14 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
