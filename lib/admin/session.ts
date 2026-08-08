/**
 * Admin session tokens.
 *
 * A session is a signed, expiring token stored in a single httpOnly
 * cookie: `base64url(payload-json).base64url(hmac-sha256-signature)`.
 * No session store/database table is needed — the signature itself is
 * the proof the payload hasn't been tampered with, and the embedded
 * `exp` is the proof it hasn't expired. This is intentionally the
 * simplest thing that's actually secure for a single-admin CMS: no new
 * dependency (next-auth, jose, jsonwebtoken) for what's fundamentally
 * one signed cookie.
 *
 * Built on the Web Crypto API (`crypto.subtle`), not Node's `crypto`
 * module, on purpose: `middleware.ts` runs on the Edge runtime, which
 * has Web Crypto but not Node's `crypto`. Using Web Crypto here means
 * middleware (Edge) and Server Actions/Route Handlers (Node) verify
 * sessions with the exact same code path instead of two
 * implementations that could quietly drift apart. Node has supported
 * `crypto.subtle` globally since v20, and `btoa`/`atob` since v16.
 */

const SESSION_COOKIE_NAME = "au_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  /** The admin email that authenticated — informational only (there's exactly one admin account today), useful if that ever changes. */
  sub: string;
  /** Issued-at, unix seconds. */
  iat: number;
  /** Expiry, unix seconds. */
  exp: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let cachedKeyPromise: Promise<CryptoKey> | null = null;

function getSigningKey(): Promise<CryptoKey> {
  if (cachedKeyPromise) return cachedKeyPromise;

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Generate one with `openssl rand -hex 32` " +
        "and add it in Vercel Project Settings -> Environment Variables (and " +
        ".env.local for local dev) — see .env.example."
    );
  }

  cachedKeyPromise = crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return cachedKeyPromise;
}

/** Constant-time-ish byte comparison — avoids a short-circuit `===` on secret-derived bytes. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

/** Creates a signed session token for the given admin email, valid for SESSION_MAX_AGE_SECONDS. */
export async function createSessionToken(email: string): Promise<string> {
  const key = await getSigningKey();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { sub: email, iat: now, exp: now + SESSION_MAX_AGE_SECONDS };

  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  const signatureB64 = bytesToBase64Url(new Uint8Array(signature));

  return `${payloadB64}.${signatureB64}`;
}

/** Verifies a session token's signature and expiry. Returns the payload if valid, otherwise null — never throws on malformed/tampered input. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signatureB64] = parts as [string, string];

  try {
    const key = await getSigningKey();
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payloadB64)
    );

    if (!timingSafeEqual(new Uint8Array(expectedSignature), base64UrlToBytes(signatureB64))) {
      return null;
    }

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payloadB64))
    ) as SessionPayload;

    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
