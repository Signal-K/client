import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

type LeaderEntry = { user_id: string; username: string | null; full_name: string | null; avatar_url: string | null; count: number };

function toLeaderboard(countsByUser: Map<string, number>, profileByUserId: Map<string, Record<string, any>>): LeaderEntry[] {
  return [...countsByUser.entries()]
    .map(([userId, count]) => {
      const profile = profileByUserId.get(userId);
      return {
        user_id: userId,
        username: profile?.username || "Anonymous",
        full_name: profile?.fullName || "Unknown",
        avatar_url: profile?.avatarUrl ?? null,
        count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function GET() {
  const pb = await createPocketbaseAdminClient();

  const [probes, sunspotClassifications] = await Promise.all([
    pb.collection("defensive_probes").getFullList({ fields: "userId,count" }),
    pb.collection("classifications").getFullList({
      filter: pb.filter("classificationtype = {:t}", { t: "sunspot" }),
      fields: "author",
    }),
  ]);

  const probeCounts = new Map<string, number>();
  for (const p of probes) {
    if (!p.userId) continue;
    probeCounts.set(p.userId, (probeCounts.get(p.userId) ?? 0) + (p.count ?? 0));
  }

  const classificationCounts = new Map<string, number>();
  for (const c of sunspotClassifications) {
    if (!c.author) continue;
    classificationCounts.set(c.author, (classificationCounts.get(c.author) ?? 0) + 1);
  }

  const allUserIds = [...new Set([...probeCounts.keys(), ...classificationCounts.keys()])];
  let profileByUserId = new Map<string, Record<string, any>>();
  if (allUserIds.length > 0) {
    const filter = allUserIds.map((id) => pb.filter("userId = {:id}", { id })).join(" || ");
    const profiles = await pb.collection("profiles").getFullList({ filter });
    profileByUserId = new Map(profiles.map((p) => [p.userId, p]));
  }

  return NextResponse.json({
    probeLeaders: toLeaderboard(probeCounts, profileByUserId),
    classificationLeaders: toLeaderboard(classificationCounts, profileByUserId),
  });
}
