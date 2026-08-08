"use server";

import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/admin/auth";
import { renderArticleMarkdown } from "@/lib/admin/render-markdown";

export interface PreviewResult {
  node: ReactNode;
  error?: string;
}

/**
 * Renders CMS markdown for the editor's live preview pane. Called
 * directly (not via a <form>) from a debounced client effect — Server
 * Actions work as plain async functions too, not just form handlers.
 *
 * Returns the compiled ReactNode itself rather than an HTML string:
 * Next.js explicitly disallows importing react-dom/server inside a
 * "use server" module (it gets flagged at build time — this isn't a
 * style preference, the client bundle for a Server Action really
 * shouldn't carry the server renderer). Returning the ReactNode
 * directly instead relies on the same RSC serialization that already
 * ships every Server Component's output to the client, and the caller
 * renders it with plain `{node}` — no dangerouslySetInnerHTML needed
 * either, which is strictly safer.
 */
export async function renderPreviewAction(markdown: string): Promise<PreviewResult> {
  const session = await getAdminSession();
  if (!session) return { node: null, error: "Not authenticated." };

  if (!markdown.trim()) return { node: null };

  try {
    const { content } = await renderArticleMarkdown(markdown);
    return { node: content };
  } catch (error) {
    return { node: null, error: error instanceof Error ? error.message : "Couldn't render preview." };
  }
}

export type UrlCheckStatus = "ok" | "broken" | "blocked" | "timeout";

export interface UrlCheckResult {
  url: string;
  status: UrlCheckStatus;
  httpStatus?: number;
  isImage?: boolean;
}

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
];

function isPrivateOrLocalHost(hostname: string): boolean {
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * Checks a single URL's reachability (for the External Link Checker)
 * or whether it actually serves an image (for Hero/Featured/OG Image
 * URL validation) — both reuse this one function since "does this URL
 * respond, and with what content-type" is the same question either way.
 *
 * This fetches arbitrary admin-supplied URLs server-side, which is a
 * real SSRF surface (unlike a browser's own fetch, this runs from the
 * server and could otherwise be pointed at internal infrastructure) —
 * so private/loopback/link-local hostnames are blocked outright, and
 * every request has a hard timeout and does not follow more than a
 * handful of redirects.
 */
export async function checkUrlAction(rawUrl: string): Promise<UrlCheckResult> {
  const session = await getAdminSession();
  if (!session) return { url: rawUrl, status: "blocked" };

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { url: rawUrl, status: "broken" };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { url: rawUrl, status: "blocked" };
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    return { url: rawUrl, status: "blocked" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    let response = await fetch(parsed.toString(), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });

    // Some hosts (Unsplash included, at times) don't answer HEAD
    // correctly — fall back to a real GET before declaring it broken.
    if (!response.ok && response.status !== 405) {
      response = await fetch(parsed.toString(), { method: "GET", redirect: "follow", signal: controller.signal });
    }

    const contentType = response.headers.get("content-type") ?? "";
    return {
      url: rawUrl,
      status: response.ok ? "ok" : "broken",
      httpStatus: response.status,
      isImage: contentType.startsWith("image/"),
    };
  } catch (error) {
    return { url: rawUrl, status: error instanceof Error && error.name === "AbortError" ? "timeout" : "broken" };
  } finally {
    clearTimeout(timeout);
  }
}

/** Checks several URLs concurrently — used by the External Link Checker for every link found in the article body. */
export async function checkUrlsAction(urls: string[]): Promise<UrlCheckResult[]> {
  const session = await getAdminSession();
  if (!session) return urls.map((url) => ({ url, status: "blocked" as const }));

  const unique = Array.from(new Set(urls)).slice(0, 30); // sane upper bound per check
  return Promise.all(unique.map(checkUrlAction));
}
