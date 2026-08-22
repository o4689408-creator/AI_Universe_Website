import { MongoClient, type Db, MongoServerError } from "mongodb";

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
 *
 * Connection options are tuned for "one small serverless function
 * talking to Atlas," not a long-running server with many concurrent
 * users: a small pool avoids the overhead of provisioning connections
 * that will mostly sit idle, and short timeouts mean a genuinely
 * unreachable cluster fails fast (a few seconds) instead of a request
 * hanging for the driver's much longer default.
 *
 * STALE-CONNECTION HANDLING (see withDb below): a client that connects
 * successfully gets cached and reused — correctly, since reconnecting
 * on every call would be its own production problem. But a connection
 * that's sat idle for a while can be silently closed by Atlas or a
 * network intermediary in between, and the *first* operation attempted
 * on that now-dead socket is what actually surfaces — as a raw TLS-
 * layer failure ("SSL routines:ssl3_read_bytes:tlsv1 alert internal
 * error", SSL alert 80), not a clean "reconnect me" signal. This is a
 * well-documented MongoDB-driver-in-serverless failure class (Vercel,
 * AWS Lambda, and ECS deployments all report it), not specific to this
 * project. maxIdleTimeMS below reduces how often a connection gets old
 * enough to hit this at all; withDb is the second line of defense for
 * whenever it still happens.
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

  const client = new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    // Proactively recycle a connection once it's been idle this long,
    // rather than waiting to discover — mid-operation — that Atlas or
    // a network intermediary already closed it. 30s is comfortably
    // shorter than typical idle timeouts imposed by cloud load
    // balancers, so this client closes stale connections on its own
    // terms instead of finding out the hard way.
    maxIdleTimeMS: 30000,
  });
  return client.connect();
}

/** Discards the cached client/promise so the next getMongoClient() call creates an entirely fresh one, rather than handing back a connection already known to be broken. */
function resetClientCache(): void {
  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise = undefined;
  } else {
    cachedClientPromise = null;
  }
}

/** Returns the shared MongoClient, connecting once and reusing it thereafter. */
export function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
      // If the very first connection attempt fails (a transient
      // network blip, Atlas cluster paused, etc.), the cached promise
      // would otherwise stay rejected for as long as this dev process
      // runs — every request would fail immediately without ever
      // retrying. Clearing the cache on rejection means the next
      // request gets a fresh connection attempt instead of a
      // permanently poisoned one.
      global._mongoClientPromise.catch(() => {
        global._mongoClientPromise = undefined;
      });
    }
    return global._mongoClientPromise;
  }

  if (!cachedClientPromise) {
    cachedClientPromise = createClientPromise();
    cachedClientPromise.catch(() => {
      cachedClientPromise = null;
    });
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

/**
 * Runs a database operation and — this is the actual fix for the "SSL
 * alert 80 / internal error" publishing failure — if it fails for any
 * reason, evicts the cached client and retries the *entire operation*
 * exactly once before giving up. `operation` should call getDb() (or
 * getArticlesCollection()-style helpers that call it) itself, rather
 * than receiving a `db` handle as a parameter — re-invoking the whole
 * callback is what naturally picks up the freshly-cleared cache on
 * retry, with no need to thread a db object through every call site.
 *
 * Why this exists: getMongoClient() caches a resolved, already-connected
 * client for reuse (correctly — reconnecting on every call would be its
 * own production problem, which is exactly what this task explicitly
 * warns against). But a client that connected successfully five minutes
 * ago can still go stale later: MongoDB Atlas and any network
 * intermediary in between (Vercel's own infrastructure included) will
 * eventually close a connection that's sat idle, and the *first*
 * operation attempted on that now-dead socket is what actually
 * surfaces it — as a raw TLS-layer failure, not a clean "reconnect me"
 * signal the driver quietly recovers from. The previous code only ever
 * cleared its cache when the *initial* `.connect()` call itself
 * rejected; a client that connected fine and went stale *after* being
 * cached was never evicted, so every operation against that now-dead
 * cached client — including, and especially, a multi-step one like
 * publishing an article — would keep failing identically until that
 * whole serverless function instance eventually cold-starts again.
 *
 * A note on write safety: retrying an already-attempted write only
 * risks a duplicate if the original attempt actually succeeded on the
 * server but lost its acknowledgment before this client found out — a
 * narrow window, and the MongoDB driver's own retryWrites (on by
 * default) already covers the much more common "transient blip on the
 * same connection" case safely via its own retry protocol; this adds a
 * second, more drastic layer (discard the whole client, not just retry
 * the wire command) for when even that couldn't recover. For the one
 * operation here where a duplicate would actually matter — creating a
 * new article — the collection's unique index on `slug` means a
 * genuine double-write fails loudly with a duplicate-key error instead
 * of silently duplicating data; see createArticle in
 * lib/admin/articles.ts, which treats that specific error as "this
 * probably already succeeded" rather than a hard failure.
 */
export async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    resetClientCache();
    return operation();
  }
}

export { MongoServerError };
