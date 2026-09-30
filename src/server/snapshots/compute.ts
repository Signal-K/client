// Producers for the public snapshots (SSC-37). They run on the Worker's cron
// trigger, never on a user request, and each makes a small, bounded number of
// PocketBase reads. Everything here must be safe to show to any visitor except
// fields the read side strips (see definitions.ts).
import type PocketBase from "pocketbase";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Rows scanned for the unique-author / unique-project counts. */
export const ACTIVITY_SCAN_LIMIT = 500;

export type LandingStats = {
  totalClassifications: number;
  classificationsLast24h: number;
  activeSailors24h: number;
  activeProjects7d: number;
  /** Classifications per project type over the last 7 days (from the scan). */
  projects: Array<{ type: string; classifications7d: number }>;
  /** True when a window held more rows than ACTIVITY_SCAN_LIMIT, so counts are lower bounds. */
  sampled: boolean;
};

export async function computeLandingStats(pb: PocketBase, now: number): Promise<LandingStats> {
  const dayAgo = new Date(now - DAY_MS).toISOString();
  const weekAgo = new Date(now - 7 * DAY_MS).toISOString();
  const classifications = pb.collection("ss_classifications");

  const [total, lastDay, lastWeek] = await Promise.all([
    classifications.getList(1, 1, { fields: "id" }),
    classifications.getList(1, ACTIVITY_SCAN_LIMIT, {
      filter: pb.filter("createdAt >= {:since} && author != null", { since: dayAgo }),
      fields: "author",
    }),
    classifications.getList(1, ACTIVITY_SCAN_LIMIT, {
      filter: pb.filter("createdAt >= {:since} && classificationtype != null", { since: weekAgo }),
      fields: "classificationtype",
    }),
  ]);

  const authors = new Set(lastDay.items.map((row) => row.author).filter((v): v is string => typeof v === "string" && v.length > 0));
  const perType = new Map<string, number>();
  for (const row of lastWeek.items) {
    const type = row.classificationtype;
    if (typeof type === "string" && type) perType.set(type, (perType.get(type) ?? 0) + 1);
  }

  return {
    totalClassifications: total.totalItems,
    classificationsLast24h: lastDay.totalItems,
    activeSailors24h: authors.size,
    activeProjects7d: perType.size,
    projects: [...perType.entries()]
      .map(([type, classifications7d]) => ({ type, classifications7d }))
      .sort((a, b) => b.classifications7d - a.classifications7d || a.type.localeCompare(b.type)),
    sampled: lastDay.totalItems > lastDay.items.length || lastWeek.totalItems > lastWeek.items.length,
  };
}

export type LeaderEntry = { user_id: string; username: string; full_name: string; avatar_url: string | null; count: number };
export type SunspotLeaderboard = { probeLeaders: LeaderEntry[]; classificationLeaders: LeaderEntry[] };

const LEADERBOARD_SIZE = 10;

function topCounts(counts: Map<string, number>): Array<[string, number]> {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, LEADERBOARD_SIZE);
}

export async function computeSunspotLeaderboard(pb: PocketBase): Promise<SunspotLeaderboard> {
  const [probes, sunspots] = await Promise.all([
    pb.collection("defensive_probes").getFullList({ fields: "userId,count" }),
    pb.collection("ss_classifications").getFullList({
      filter: pb.filter("classificationtype = {:t}", { t: "sunspot" }),
      fields: "author",
    }),
  ]);

  const probeCounts = new Map<string, number>();
  for (const p of probes) {
    if (!p.userId) continue;
    probeCounts.set(p.userId, (probeCounts.get(p.userId) ?? 0) + (Number(p.count) || 0));
  }
  const classificationCounts = new Map<string, number>();
  for (const c of sunspots) {
    if (!c.author) continue;
    classificationCounts.set(c.author, (classificationCounts.get(c.author) ?? 0) + 1);
  }

  const topProbes = topCounts(probeCounts);
  const topClassifiers = topCounts(classificationCounts);

  // Only the ranked users need a profile, at most 2 × LEADERBOARD_SIZE.
  const ids = [...new Set([...topProbes, ...topClassifiers].map(([id]) => id))];
  const profiles = ids.length
    ? await pb.collection("profiles").getFullList({
        filter: ids.map((id) => pb.filter("userId = {:id}", { id })).join(" || "),
        fields: "userId,username,fullName,avatarUrl",
      })
    : [];
  const byUser = new Map(profiles.map((p) => [p.userId as string, p]));

  const entry = ([userId, count]: [string, number]): LeaderEntry => {
    const profile = byUser.get(userId);
    return {
      user_id: userId,
      username: profile?.username || "Anonymous",
      full_name: profile?.fullName || "Unknown",
      avatar_url: profile?.avatarUrl ?? null,
      count,
    };
  };

  return { probeLeaders: topProbes.map(entry), classificationLeaders: topClassifiers.map(entry) };
}

export type CommunityActivityItem = { id: number; author: string; authorId: string | null; type: string | null; at: string };

/** Kept larger than the 12 the UI shows so `?exclude=<self>` still fills the list. */
export const COMMUNITY_ACTIVITY_SIZE = 24;

export async function computeCommunityActivity(pb: PocketBase, now: number): Promise<CommunityActivityItem[]> {
  const rows = await pb.collection("ss_classifications").getList(1, COMMUNITY_ACTIVITY_SIZE, {
    filter: pb.filter("createdAt >= {:d}", { d: new Date(now - DAY_MS).toISOString() }),
    sort: "-createdAt",
    fields: "legacyId,author,classificationtype,createdAt",
  });
  return rows.items.map((r) => ({
    id: r.legacyId as number,
    author: (r.author as string | null)?.slice(0, 8) ?? "user",
    authorId: (r.author as string | null) ?? null,
    type: (r.classificationtype as string | null) ?? null,
    at: r.createdAt as string,
  }));
}

export type HubTopProfile = { userId: string; username: string | null; score: number };

export async function computeHubTopProfiles(pb: PocketBase): Promise<HubTopProfile[]> {
  const result = await pb.collection("profiles").getList(1, 5, {
    sort: "-classificationPoints,+updatedAt",
    fields: "userId,username,classificationPoints",
  });
  return result.items.map((p) => ({
    userId: p.userId as string,
    username: (p.username as string | null) || null,
    score: Number(p.classificationPoints ?? 0),
  }));
}
