"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useRipple } from "@/lib/hooks/useRipple";
import { buildMailtoLink } from "@/lib/config";

type Status = "idle" | "submitting" | "success" | "error" | "not-configured";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * A compact single-line variant of sections/NewsletterSection.tsx for
 * the footer — same /api/newsletter endpoint, smaller footprint so it
 * fits a footer column instead of a full centered band.
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
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        configured?: boolean;
      };

      if (data.configured === false) {
        setStatus("not-configured");
        return;
      }
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
      <p className="text-body-sm text-accent animate-fade-up">
        You&apos;re on the list — check your inbox!
      </p>
    );
  }

  if (status === "not-configured") {
    return (
      <a
        href={buildMailtoLink()}
        className="text-body-sm text-accent underline-offset-4 hover:underline"
      >
        Email us directly instead →
      </a>
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
          aria-invalid={status === "error"}
          className="min-w-0 flex-1 rounded-md border border-border bg-bg-base px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          onPointerDown={handleRipple}
          className={cn(
            "relative shrink-0 overflow-hidden rounded-md bg-accent px-3.5 py-2.5 text-body-sm font-medium text-bg-base",
            "transition-transform duration-fast ease-out hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40"
          )}
        >
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
