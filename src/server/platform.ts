// Cloudflare bindings, as seen by code shared between the app Worker and the
// Next.js dev/test server (SSC-37, SSC-39).
//
// The Worker installs the real bindings (Workers KV, Queues, waitUntil) with
// configurePlatform() before it runs a route handler, queue batch or cron.
// Anywhere else (next dev, `yarn start` for Cypress, vitest) the defaults
// apply: an in-memory KV and jobs that run in the background of the same
// process, so the app still works without Cloudflare.

/** The subset of a Workers KV namespace we use. */
export type KVLike = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options: { prefix: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
};

export type PlatformJobSender = (messages: Array<{ body: unknown; delaySeconds?: number }>) => Promise<void>;

export type Platform = {
  kv: KVLike;
  /** Cloudflare Queues producer; null runs jobs in the background instead. */
  sendJobs: PlatformJobSender | null;
  /** Keeps background work alive after the response (Worker `ctx.waitUntil`). */
  waitUntil: ((promise: Promise<unknown>) => void) | null;
  /** True when kv is the in-memory stand-in rather than Workers KV. */
  localFallback: boolean;
};

export function createMemoryKV(): KVLike {
  const store = new Map<string, { value: string; expiresAt: number | null }>();
  const live = (key: string) => {
    const entry = store.get(key);
    if (entry && entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry;
  };
  return {
    async get(key) {
      const entry = live(key);
      return entry ? JSON.parse(entry.value) : null;
    },
    async put(key, value, options) {
      store.set(key, { value, expiresAt: options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : null });
    },
    async delete(key) {
      store.delete(key);
    },
    async list({ prefix, limit = 1000 }) {
      const keys = [...store.keys()].filter((name) => name.startsWith(prefix) && live(name)).sort();
      return { keys: keys.slice(0, limit).map((name) => ({ name })), list_complete: keys.length <= limit };
    },
  };
}

let fallback: Platform | null = null;
let installed: (() => Platform) | null = null;

/** The Worker passes a resolver so waitUntil can follow the current request. */
export function configurePlatform(resolver: (() => Platform) | null) {
  installed = resolver;
}

export function platform(): Platform {
  if (installed) return installed();
  fallback ??= { kv: createMemoryKV(), sendJobs: null, waitUntil: null, localFallback: true };
  return fallback;
}

/** Tests: forget the in-memory KV between cases. */
export function resetLocalPlatform() {
  fallback = null;
}
