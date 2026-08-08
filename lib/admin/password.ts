import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Password hashing for the Admin login, built on Node's built-in
 * `crypto.scrypt` rather than adding bcrypt/argon2 as a dependency —
 * scrypt is a real, well-regarded memory-hard KDF and is already
 * available with zero extra install. Only ever used server-side
 * (Server Actions run in the Node runtime, not Edge), so Node's
 * `node:crypto` is fine here — unlike lib/admin/session.ts, which
 * also needs to run in Edge middleware and therefore uses Web Crypto.
 *
 * Stored format: "<saltHex>:<hashHex>" — see scripts/create-admin-password.mjs
 * for the CLI that generates this for ADMIN_PASSWORD_HASH.
 */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [saltHex, hashHex] = parts as [string, string];

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
