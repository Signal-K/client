import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { unstable_cache } from "next/cache";

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

const getCachedTopProfiles = unstable_cache(
  async () => {
    const pb = await createPocketbaseAdminClient();
    const result = await pb.collection("profiles").getList(1, 5, {
      sort: "-classificationPoints,+updatedAt",
      fields: "userId,username,classificationPoints",
    });
    return result.items;
  },
  ["hub-top-profiles"],
  { revalidate: 300, tags: ["leaderboard"] }
);

export async function getHubLeaderboard(userId: string): Promise<HubLeaderboardData> {
  const topProfiles = await getCachedTopProfiles();
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
    score: Number(profile.classificationPoints ?? 0),
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
