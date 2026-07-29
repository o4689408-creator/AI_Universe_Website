"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { buildMailtoLink } from "@/lib/config";

type Status = "idle" | "submitting" | "success" | "error" | "not-configured";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Posts to app/api/contact/route.ts, which relays the message to
 * CONTACT_EMAIL (lib/config.ts) via Resend. See that route's doc
 * comment for the required RESEND_API_KEY / RESEND_FROM env vars.
 *
 * If Resend isn't configured yet, the route returns `configured:
 * false` rather than an error — this form then falls back to opening
 * the visitor's own mail client with the message prefilled (via
 * GmailButton's same `mailto:` mechanism), so filling out the form is
 * never a dead end even before the owner has set up email sending.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !message.trim()) {
      setError("Please fill in your name and message.");
      setStatus("error");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        configured?: boolean;
      };

      if (data.configured === false) {
        const body = `From: ${name} (${email})\n\n${message}`;
        window.location.href = buildMailtoLink(undefined, `Message from ${name}`, body);
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

  if (status === "success" || status === "not-configured") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-accent-muted text-accent">
          <CheckIcon />
        </span>
        {status === "success" ? (
          <>
            <p className="text-body-lg font-medium text-text-primary">Message sent.</p>
            <p className="text-body-sm text-text-secondary">
              Thanks for reaching out — we&apos;ll get back to you soon.
            </p>
          </>
        ) : (
          <>
            <p className="text-body-lg font-medium text-text-primary">Almost there.</p>
            <p className="text-body-sm text-text-secondary">
              We opened your email app with your message ready — just hit send.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="text-body-sm text-text-secondary">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className="rounded-md border border-border bg-bg-surface-1 px-4 py-3 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="text-body-sm text-text-secondary">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          aria-invalid={status === "error"}
          className="rounded-md border border-border bg-bg-surface-1 px-4 py-3 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-body-sm text-text-secondary">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="resize-none rounded-md border border-border bg-bg-surface-1 px-4 py-3 text-body-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:shadow-glow-accent focus:outline-none"
        />
      </div>

      {status === "error" && error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}

function CheckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M7 13.5 11 17.5 19.5 8.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
