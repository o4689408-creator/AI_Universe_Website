"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";

type Status = "idle" | "submitting" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * A compact single-line variant of sections/NewsletterSection.tsx for
 * the footer — same /api/newsletter endpoint (MongoDB Atlas storage, no
 * "not configured" fallback ever shown to visitors), smaller
 * footprint so it fits a footer column instead of a full band.
 */
export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const handleRipple = useRipple();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email.");
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
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="flex items-center gap-2 text-body-sm text-accent animate-fade-up">
        <span aria-hidden="true">🎉</span>
        Welcome! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={status === "submitting"}
          aria-invalid={status === "error"}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg-base px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          onPointerDown={handleRipple}
          className={cn(
            "relative flex shrink-0 items-center gap-1.5 overflow-hidden rounded-md bg-accent px-3.5 py-2.5 text-body-sm font-medium text-bg-base",
            "transition-transform duration-fast ease-out hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40"
          )}
        >
          {status === "submitting" && <Spinner />}
          {status === "submitting" ? "…" : "Join"}
        </button>
      </div>
      {status === "error" && error && (
        <p role="alert" className="text-label text-error">
          {error}
        </p>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6" />
      <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
