// Published public snapshots (SSC-37).
//
// The Worker's cron trigger computes every snapshot and writes them to Workers
// KV as ONE versioned bundle (`public-snapshots:v1`), so a refresh is a single
// KV write (Free plan: 1,000 writes/day). Requests only read the bundle: no
// PocketBase fan-out on the request path.
//
// Each section records when it was generated and when a refresh last failed,
// so readers can tell fresh, stale and missing data apart:
//   fresh    generated within the section's maxAgeSeconds
//   stale    older than that (the cron has been failing or not running);
//            still served, flagged via `status` and `x-snapshot-status`
//   missing  never generated, or stored with an older section schema
import type PocketBase from "pocketbase";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { platform } from "@/src/server/platform";
import {
  computeCommunityActivity,
  computeHubTopProfiles,
  computeLandingStats,
  computeSunspotLeaderboard,
  type CommunityActivityItem,
  type HubTopProfile,
  type LandingStats,
  type SunspotLeaderboard,
} from "./compute";

export const SNAPSHOT_BUNDLE_KEY = "public-snapshots:v1";

type Definition<T> = {
  /** Bump when the shape of `data` changes; older stored sections read as missing. */
  schema: number;
  maxAgeSeconds: number;
  /** Served by /api/public/snapshots/[name]. Internal ones hold user ids. */
  public: boolean;
  compute: (pb: PocketBase, now: number) => Promise<T>;
};

export const snapshotDefinitions = {
  "landing-stats": { schema: 1, maxAgeSeconds: 30 * 60, public: true, compute: computeLandingStats } as Definition<LandingStats>,
  "sunspot-leaderboard": { schema: 1, maxAgeSeconds: 30 * 60, public: true, compute: (pb) => computeSunspotLeaderboard(pb) } as Definition<SunspotLeaderboard>,
  "community-activity": { schema: 1, maxAgeSeconds: 30 * 60, public: false, compute: computeCommunityActivity } as Definition<CommunityActivityItem[]>,
  "hub-top-profiles": { schema: 1, maxAgeSeconds: 30 * 60, public: false, compute: (pb) => computeHubTopProfiles(pb) } as Definition<HubTopProfile[]>,
};

export type SnapshotName = keyof typeof snapshotDefinitions;
export type SnapshotData<N extends SnapshotName> = Awaited<ReturnType<(typeof snapshotDefinitions)[N]["compute"]>>;

export const isSnapshotName = (name: string): name is SnapshotName => Object.hasOwn(snapshotDefinitions, name);

export type StoredSection = {
  schema: number;
  generatedAt: string | null;
  data: unknown;
  lastAttemptAt: string;
  lastError: string | null;
};

export type SnapshotBundle = { version: 1; sections: Partial<Record<SnapshotName, StoredSection>> };

export type SnapshotRead<T> = {
  name: SnapshotName;
  status: "fresh" | "stale" | "missing";
  data: T | null;
  generatedAt: string | null;
  ageSeconds: number | null;
  lastAttemptAt: string | null;
  lastError: string | null;
};

// Every read in an isolate within this window shares one KV read.
const MEMO_MS = 30_000;
let memo: { at: number; bundle: SnapshotBundle | null } | null = null;

export function resetSnapshotMemo() {
  memo = null;
}

async function loadBundle(now: number): Promise<SnapshotBundle | null> {
  if (memo && now - memo.at < MEMO_MS) return memo.bundle;
  const raw = (await platform().kv.get(SNAPSHOT_BUNDLE_KEY, "json")) as SnapshotBundle | null;
  const bundle = raw && raw.version === 1 && typeof raw.sections === "object" ? raw : null;
  memo = { at: now, bundle };
  return bundle;
}

export function describeSection<N extends SnapshotName>(name: N, section: StoredSection | undefined, now: number): SnapshotRead<SnapshotData<N>> {
  const definition = snapshotDefinitions[name];
  const usable = section && section.schema === definition.schema && section.generatedAt ? section : null;
  const ageSeconds = usable ? Math.max(0, Math.round((now - Date.parse(usable.generatedAt!)) / 1000)) : null;
  return {
    name,
    status: !usable ? "missing" : ageSeconds! > definition.maxAgeSeconds ? "stale" : "fresh",
    data: usable ? (usable.data as SnapshotData<N>) : null,
    generatedAt: usable?.generatedAt ?? null,
    ageSeconds,
    lastAttemptAt: section?.lastAttemptAt ?? null,
    lastError: section?.lastError ?? null,
  };
}

let localRefresh: Promise<unknown> | null = null;

export async function readSnapshot<N extends SnapshotName>(name: N, now = Date.now()): Promise<SnapshotRead<SnapshotData<N>>> {
  let bundle = await loadBundle(now);
  // next dev / Cypress: no cron runs, so build the in-memory bundle on first use.
  if (!bundle?.sections[name] && platform().localFallback) {
    localRefresh ??= refreshSnapshots({ now }).finally(() => (localRefresh = null));
    await localRefresh;
    bundle = await loadBundle(now);
  }
  return describeSection(name, bundle?.sections[name], now);
}

export async function readAllSnapshots(now = Date.now()) {
  const bundle = await loadBundle(now);
  return (Object.keys(snapshotDefinitions) as SnapshotName[]).map((name) => describeSection(name, bundle?.sections[name], now));
}

export type RefreshReport = {
  at: string;
  results: Array<{ name: SnapshotName; ok: boolean; error: string | null; ms: number }>;
};

/**
 * Recompute every snapshot and publish the bundle with one KV write. A failed
 * section keeps its previous data and generatedAt (it turns stale after
 * maxAgeSeconds) and records the error, so a PocketBase outage degrades to
 * old numbers instead of empty ones.
 */
export async function refreshSnapshots(options: { now?: number; pb?: () => Promise<PocketBase> } = {}): Promise<RefreshReport> {
  const now = options.now ?? Date.now();
  const at = new Date(now).toISOString();
  const kv = platform().kv;
  const previous = ((await kv.get(SNAPSHOT_BUNDLE_KEY, "json")) as SnapshotBundle | null) ?? null;
  const sections: SnapshotBundle["sections"] = previous?.version === 1 ? { ...previous.sections } : {};

  let client: Promise<PocketBase> | null = null;
  const pb = () => (client ??= (options.pb ?? createPocketbaseAdminClient)());

  const names = Object.keys(snapshotDefinitions) as SnapshotName[];
  const results = await Promise.all(
    names.map(async (name) => {
      const definition = snapshotDefinitions[name] as Definition<unknown>;
      const started = Date.now();
      try {
        const data = await definition.compute(await pb(), now);
        sections[name] = { schema: definition.schema, generatedAt: at, data, lastAttemptAt: at, lastError: null };
        return { name, ok: true, error: null, ms: Date.now() - started };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const kept = sections[name]?.schema === definition.schema ? sections[name]! : null;
        sections[name] = {
          schema: definition.schema,
          generatedAt: kept?.generatedAt ?? null,
          data: kept?.data ?? null,
          lastAttemptAt: at,
          lastError: message.slice(0, 500),
        };
        console.error(`[snapshots] ${name} refresh failed: ${message}`);
        return { name, ok: false, error: message, ms: Date.now() - started };
      }
    }),
  );

  const bundle: SnapshotBundle = { version: 1, sections };
  await kv.put(SNAPSHOT_BUNDLE_KEY, JSON.stringify(bundle));
  memo = { at: now, bundle };
  return { at, results };
}

/** Response headers that make snapshot freshness visible to clients and logs. */
export function snapshotHeaders(read: SnapshotRead<unknown>): Record<string, string> {
  const headers: Record<string, string> = {
    "x-snapshot-status": read.status,
    // Shared data: browsers and the edge may reuse it briefly.
    "cache-control": read.status === "missing" ? "no-store" : "public, max-age=60",
  };
  if (read.generatedAt) headers["x-snapshot-generated-at"] = read.generatedAt;
  return headers;
}
