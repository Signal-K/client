import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { computeHubTopProfiles } from "@/src/server/snapshots/compute";
import { readSnapshot } from "@/src/server/snapshots/store";

export interface HubLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface HubLeaderboardData {
  entries: HubLeaderboardEntry[];
  currentUser: HubLeaderboardEntry | null;
}

// SSC-37: the top five come from the precomputed `hub-top-profiles` snapshot
// (cron-refreshed). Only the caller's own rank is read per request.
async function getTopProfiles() {
  const snapshot = await readSnapshot("hub-top-profiles");
  if (snapshot.data) return snapshot.data;
  // Not published yet (first minutes after the first deploy): one bounded read.
  const pb = await createPocketbaseAdminClient();
  return computeHubTopProfiles(pb);
}

export async function getHubLeaderboard(userId: string): Promise<HubLeaderboardData> {
  const topProfiles = await getTopProfiles();
  const pb = await createPocketbaseAdminClient();

  const me = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: userId }), {
      fields: "userId,username,classificationPoints",
    })
    .catch(() => null);

  const myScore = Number(me?.classificationPoints ?? 0);
  const higherCountResult = await pb.collection("profiles").getList(1, 1, {
    filter: `classificationPoints > ${myScore}`,
  });
  const higherCount = higherCountResult.totalItems;

  const entries = topProfiles.map((profile, index) => ({
    rank: index + 1,
    username: profile.username || `User ${profile.userId.slice(0, 6)}`,
    score: profile.score,
    isCurrentUser: profile.userId === userId,
  }));

  const currentUserEntry: HubLeaderboardEntry | null = me
    ? {
        rank: higherCount + 1,
        username: me.username || `User ${me.userId.slice(0, 6)}`,
        score: myScore,
        isCurrentUser: true,
      }
    : null;

  return {
    entries,
    currentUser:
      currentUserEntry && entries.some((entry) => entry.isCurrentUser)
        ? null
        : currentUserEntry,
  };
}
