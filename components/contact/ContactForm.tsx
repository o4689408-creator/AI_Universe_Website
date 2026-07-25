"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Client-side validation and local state only, matching the Newsletter
 * section's pattern (sections/NewsletterSection.tsx). Wiring a real
 * destination (e.g. a Resend-backed API route) is a follow-up — this
 * isolates that change to handleSubmit.
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
    // Placeholder for the real contact-form backend integration.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p role="status" className="text-body text-accent">
        Thanks for reaching out — we&apos;ll get back to you soon.
      </p>
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
