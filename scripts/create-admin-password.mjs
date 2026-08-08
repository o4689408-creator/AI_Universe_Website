#!/usr/bin/env node
/**
 * Generates the value for ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/create-admin-password.mjs "your-new-password"
 *
 * Copy the printed hash into ADMIN_PASSWORD_HASH in .env.local (local
 * dev) and in Vercel Project Settings -> Environment Variables
 * (production). Never commit the raw password or the hash to git.
 */
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/create-admin-password.mjs \"your-new-password\"");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Choose a password of at least 8 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
const hash = `${salt.toString("hex")}:${derivedKey.toString("hex")}`;

console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Paste that line into .env.local and into Vercel's env vars for production.\n");
