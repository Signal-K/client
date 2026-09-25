import { beforeEach, describe, expect, it, vi } from "vitest";

import { configurePlatform, createMemoryKV, type KVLike } from "@/src/server/platform";
import { fakePocketBase } from "@/src/server/testing/fakePocketBase";

import { readAllSnapshots, readSnapshot, refreshSnapshots, resetSnapshotMemo, SNAPSHOT_BUNDLE_KEY } from "./store";

const NOW = Date.parse("2026-09-25T12:00:00Z");
const minutes = (n: number) => n * 60_000;
const iso = (offsetMs: number) => new Date(NOW - offsetMs).toISOString();

let kv: KVLike;

function seed() {
  return fakePocketBase({
    ss_classifications: [
      { legacyId: 1, author: "user_a", classificationtype: "sunspot", anomaly: 1, createdAt: iso(minutes(5)) },
      { legacyId: 2, author: "user_b", classificationtype: "sunspot", anomaly: 2, createdAt: iso(minutes(30)) },
      { legacyId: 3, author: "user_a", classificationtype: "planet", anomaly: 3, createdAt: iso(minutes(60)) },
      { legacyId: 4, author: "user_c", classificationtype: "cloud", anomaly: 4, createdAt: iso(minutes(60 * 24 * 3)) },
    ],
    defensive_probes: [
      { userId: "user_b", count: 4 },
      { userId: "user_a", count: 1 },
      { userId: "user_b", count: 2 },
    ],
    profiles: [
      { userId: "user_a", username: "ada", fullName: "Ada", avatarUrl: null, classificationPoints: 30, updatedAt: "1" },
      { userId: "user_b", username: "bo", fullName: "Bo", avatarUrl: "b.png", classificationPoints: 50, updatedAt: "1" },
    ],
  });
}

beforeEach(() => {
  kv = createMemoryKV();
  resetSnapshotMemo();
  configurePlatform(() => ({ kv, sendJobs: null, waitUntil: null, localFallback: false }));
});

describe("refreshSnapshots", () => {
  it("publishes every snapshot in one versioned KV write", async () => {
    const put = vi.spyOn(kv, "put");
    const { pb } = seed();
    const report = await refreshSnapshots({ now: NOW, pb: async () => pb });

    expect(report.results.every((r) => r.ok)).toBe(true);
    expect(put).toHaveBeenCalledTimes(1);
    expect(put.mock.calls[0][0]).toBe(SNAPSHOT_BUNDLE_KEY);

    resetSnapshotMemo();
    const stats = await readSnapshot("landing-stats", NOW);
    expect(stats).toMatchObject({ status: "fresh", ageSeconds: 0 });
    expect(stats.data).toMatchObject({
      totalClassifications: 4,
      classificationsLast24h: 3,
      activeSailors24h: 2,
      activeProjects7d: 3,
      sampled: false,
    });

    const leaderboard = await readSnapshot("sunspot-leaderboard", NOW);
    expect(leaderboard.data?.probeLeaders.map((e) => [e.username, e.count])).toEqual([["bo", 6], ["ada", 1]]);
    expect(leaderboard.data?.classificationLeaders.map((e) => e.user_id)).toEqual(["user_a", "user_b"]);

    const top = await readSnapshot("hub-top-profiles", NOW);
    expect(top.data).toEqual([
      { userId: "user_b", username: "bo", score: 50 },
      { userId: "user_a", username: "ada", score: 30 },
    ]);
  });

  it("keeps the last good data and records the error when a producer fails", async () => {
    await refreshSnapshots({ now: NOW, pb: async () => seed().pb });
    const broken = fakePocketBase({}, { failOn: ["defensive_probes"] });
    const report = await refreshSnapshots({ now: NOW + minutes(40), pb: async () => broken.pb });

    expect(report.results.find((r) => r.name === "sunspot-leaderboard")).toMatchObject({ ok: false, error: "defensive_probes unavailable" });
    resetSnapshotMemo();
    const read = await readSnapshot("sunspot-leaderboard", NOW + minutes(40));
    expect(read.status).toBe("stale");
    expect(read.generatedAt).toBe(new Date(NOW).toISOString());
    expect(read.data?.probeLeaders[0].username).toBe("bo");
    expect(read.lastError).toBe("defensive_probes unavailable");
    expect(read.lastAttemptAt).toBe(new Date(NOW + minutes(40)).toISOString());
  });

  it("does not stop other snapshots when PocketBase auth fails", async () => {
    const report = await refreshSnapshots({
      now: NOW,
      pb: async () => {
        throw new Error("auth failed");
      },
    });
    expect(report.results.every((r) => !r.ok && r.error === "auth failed")).toBe(true);
    resetSnapshotMemo();
    const statuses = await readAllSnapshots(NOW);
    expect(statuses.map((s) => [s.status, s.lastError])).toEqual(statuses.map(() => ["missing", "auth failed"]));
  });
});

describe("readSnapshot", () => {
  it("reports missing before the first refresh", async () => {
    expect(await readSnapshot("landing-stats", NOW)).toMatchObject({ status: "missing", data: null, generatedAt: null });
  });

  it("turns stale after the section's max age but still serves the data", async () => {
    await refreshSnapshots({ now: NOW, pb: async () => seed().pb });
    resetSnapshotMemo();
    expect((await readSnapshot("landing-stats", NOW + minutes(29))).status).toBe("fresh");
    resetSnapshotMemo();
    const stale = await readSnapshot("landing-stats", NOW + minutes(31));
    expect(stale.status).toBe("stale");
    expect(stale.data?.totalClassifications).toBe(4);
  });

  it("treats a section stored with an older schema as missing", async () => {
    await kv.put(
      SNAPSHOT_BUNDLE_KEY,
      JSON.stringify({
        version: 1,
        sections: { "landing-stats": { schema: 0, generatedAt: new Date(NOW).toISOString(), data: { old: true }, lastAttemptAt: "", lastError: null } },
      }),
    );
    expect(await readSnapshot("landing-stats", NOW)).toMatchObject({ status: "missing", data: null });
  });

  it("shares one KV read per isolate for 30 seconds", async () => {
    const get = vi.spyOn(kv, "get");
    await readSnapshot("landing-stats", NOW);
    await readSnapshot("sunspot-leaderboard", NOW + 1000);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("builds the snapshots on demand without Cloudflare (next dev)", async () => {
    configurePlatform(() => ({ kv, sendJobs: null, waitUntil: null, localFallback: true }));
    const { pb, calls } = seed();
    vi.doMock("@/lib/pocketbase/adminClient", () => ({ createPocketbaseAdminClient: async () => pb }));
    vi.resetModules();
    const fresh = await import("./store");
    const read = await fresh.readSnapshot("landing-stats");
    expect(read.status).toBe("fresh");
    expect(calls.length).toBeGreaterThan(0);
    vi.doUnmock("@/lib/pocketbase/adminClient");
  });
});
