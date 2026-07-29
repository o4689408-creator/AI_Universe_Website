"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";

type Status = "idle" | "submitting" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const benefits = [
  { icon: "✨", label: "Exclusive AI breakthroughs" },
  { icon: "🎥", label: "New YouTube uploads" },
  { icon: "📚", label: "Premium AI guides" },
  { icon: "🔥", label: "Trending AI tools" },
  { icon: "💡", label: "Expert insights" },
  { icon: "⚡", label: "Weekly innovation updates" },
];

const welcomeBenefits = [
  { icon: "✨", label: "New AI articles" },
  { icon: "🎥", label: "Latest YouTube videos" },
  { icon: "🚀", label: "Exclusive AI discoveries" },
  { icon: "💡", label: "Weekly knowledge updates" },
];

const CONFETTI_COLORS = ["#4C7DFF", "#7DA2FF", "#FFC24C", "#4CE0B3", "#FF6B9D"];

/**
 * Purpose: convert one-time visitors into a retainable audience — the
 * highest-leverage growth mechanic for a small site publishing
 * infrequently.
 *
 * Posts to app/api/newsletter/route.ts, which stores the subscriber
 * in Vercel KV (real, persistent — see that route's doc comment) and
 * layers on a confirmation email + Resend Audience mirror if
 * configured. There is deliberately no "service not configured"
 * fallback state here: a visitor who submits a valid email always
 * sees the same premium success experience, never an error about the
 * owner's backend setup.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const handleRipple = useRipple();

  // Generated once so the burst doesn't reshuffle on re-renders.
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        angle: (360 / 18) * index + (Math.random() * 12 - 6),
        distance: 60 + Math.random() * 40,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length] ?? CONFETTI_COLORS[0]!,
        delay: Math.random() * 120,
        size: 5 + Math.random() * 4,
      })),
    []
  );

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
      const data = (await response.json().catch(() => ({}))) as { error?: string };

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
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-accent/20 bg-bg-surface-1/90 px-5 py-11 shadow-[var(--shadow-lg),var(--shadow-glow-accent)] backdrop-blur-xl sm:px-12 sm:py-16">
            {/* Ambient glow + gradient border highlight — restrained: one bloom, one edge gradient. */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/[0.16] blur-[120px]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[28px] [background:linear-gradient(135deg,transparent_40%,var(--color-accent)_100%)] opacity-[0.06]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
              aria-hidden="true"
            />

            {/* Floating CSS-only particles — pure decoration, disabled automatically under prefers-reduced-motion via the site-wide rule in globals.css. */}
            <FloatingParticles />

            <div className="relative flex flex-col items-center gap-6 text-center">
              {status === "success" ? (
                <SuccessState confettiPieces={confettiPieces} />
              ) : (
                <>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent-muted text-2xl">
                    🚀
                  </span>

                  <div className="flex flex-col gap-3">
                    <h2 className="text-balance text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
                      Join thousands of AI enthusiasts discovering the
                      future before everyone else.
                    </h2>
                    <p className="text-balance text-body text-text-secondary">
                      Become part of the AI Universe community and get:
                    </p>
                  </div>

                  <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm text-text-secondary sm:grid-cols-2">
                    {benefits.map((benefit) => (
                      <li key={benefit.label} className="flex items-center gap-2">
                        <span aria-hidden="true">{benefit.icon}</span>
                        {benefit.label}
                      </li>
                    ))}
                  </ul>

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
                      disabled={status === "submitting"}
                      aria-invalid={status === "error"}
                      aria-describedby={status === "error" ? "newsletter-error" : undefined}
                      className="min-h-[52px] flex-1 rounded-full border border-border bg-bg-base px-5 text-body text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      onPointerDown={handleRipple}
                      className={cn(
                        "group relative min-h-[52px] shrink-0 overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-br from-accent to-accent-hover px-7 text-body font-semibold text-bg-base shadow-glow-accent",
                        "transition-transform duration-base ease-out hover:scale-[1.03] active:scale-[0.97] disabled:hover:scale-100"
                      )}
                    >
                      {/* Shimmer sweep across the button — a small premium detail on the primary CTA. */}
                      <span
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-slow ease-out group-hover:translate-x-full"
                        aria-hidden="true"
                      />
                      <span className="relative flex items-center justify-center gap-2">
                        {status === "submitting" && <Spinner />}
                        {status === "submitting" ? "Subscribing…" : "Join the Community"}
                      </span>
                    </button>
                  </form>

                  <p className="text-label text-text-tertiary">
                    📩 Join today and never miss the next breakthrough. No
                    noise, no spam — unsubscribe anytime.
                  </p>

                  {status === "error" && error && (
                    <p id="newsletter-error" role="alert" className="text-body-sm text-error">
                      {error}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  );
}

function SuccessState({
  confettiPieces,
}: {
  confettiPieces: { id: number; angle: number; distance: number; color: string; delay: number; size: number }[];
}) {
  return (
    <div className="relative flex flex-col items-center gap-4 py-2">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Confetti burst — lightweight, pure CSS, generated once. */}
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="absolute left-1/2 top-1/2 rounded-full opacity-0 animate-pop-in"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}ms`,
              animationDuration: "900ms",
              animationFillMode: "forwards",
              transform: `rotate(${piece.angle}deg) translate(${piece.distance}px) rotate(-${piece.angle}deg)`,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="relative flex h-20 w-20 animate-pop-in items-center justify-center rounded-full bg-accent-muted text-accent shadow-glow-accent">
          <CheckIcon />
        </span>
      </div>

      <div className="flex flex-col gap-2 animate-fade-up" style={{ animationDelay: "150ms" }}>
        <h2 className="text-heading-3 font-semibold text-text-primary">
          🎉 Welcome to AI Universe!
        </h2>
        <p className="text-body text-text-secondary">
          You&apos;re officially part of our global AI community.
        </p>
      </div>

      <ul
        className="grid grid-cols-1 gap-x-6 gap-y-2 text-body-sm text-text-secondary opacity-0 animate-fade-up sm:grid-cols-2"
        style={{ animationDelay: "280ms" }}
      >
        {welcomeBenefits.map((benefit) => (
          <li key={benefit.label} className="flex items-center gap-2">
            <span aria-hidden="true">{benefit.icon}</span>
            {benefit.label}
          </li>
        ))}
      </ul>

      <p className="text-body-sm text-text-tertiary opacity-0 animate-fade-up" style={{ animationDelay: "380ms" }}>
        Thank you for joining us!
      </p>
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: index,
        left: 8 + Math.random() * 84,
        top: 10 + Math.random() * 70,
        size: 3 + Math.random() * 4,
        duration: 10 + Math.random() * 8,
        delay: Math.random() * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-accent/30 animate-ambient-drift"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6" />
      <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M8 14.5 12 18.5 20 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
