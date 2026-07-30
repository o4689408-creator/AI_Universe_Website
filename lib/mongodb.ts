import { MongoClient, type Db } from "mongodb";

/**
 * MongoDB Atlas connection helper — single shared client, reused
 * across requests/invocations rather than reconnecting every time.
 *
 * Reads MONGODB_URI from the environment (set in Vercel Project
 * Settings -> Environment Variables when you connect MongoDB Atlas —
 * see .env.example). Optionally MONGODB_DB to override the database
 * name; defaults to "ai_universe".
 *
 * Caches the client on `globalThis` in development so Next.js's hot
 * reload (which re-evaluates modules on every edit) doesn't open a
 * new connection every save. In production (serverless), each cold
 * start creates one client that's reused for the lifetime of that
 * function instance — the standard pattern recommended by both Vercel
 * and MongoDB for serverless deployments.
 */

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "ai_universe";

let cachedClientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it in Vercel Project Settings -> Environment " +
        "Variables (it's provided automatically once you connect MongoDB Atlas " +
        "via the Vercel integration) — see .env.example."
    );
  }

  const client = new MongoClient(uri);
  return client.connect();
}

/** Returns the shared MongoClient, connecting once and reusing it thereafter. */
export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }

  if (!cachedClientPromise) {
    cachedClientPromise = createClientPromise();
  }
  return cachedClientPromise;
}

/** Returns the app's database (MONGODB_DB, default "ai_universe"). */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/** Whether MONGODB_URI is configured at all — lets routes degrade gracefully if not. */
export function isMongoConfigured(): boolean {
  return Boolean(uri);
}
