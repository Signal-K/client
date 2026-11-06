import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { computeHubTopProfiles } from "@/src/server/snapshots/compute";
import { readSnapshot } from "@/src/server/snapshots/store";
import { fetchLedgerLeaderboard, ledgerUserIds, shapeLedgerLeaderboard } from "@/src/lib/server/ledger-leaderboard";

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

// SSL-784: the ledger is the score. One request to the shared backend returns the
// top five and the caller's rank; one profiles read names them. When the shared
// backend is not configured, is down, or holds no scores yet, the old
// classificationPoints leaderboard below is used instead.
async function getLedgerHubLeaderboard(userId: string): Promise<HubLeaderboardData | null> {
  const ledger = await fetchLedgerLeaderboard(userId);
  if (!ledger) return null;
  const ids = ledgerUserIds(ledger, userId);
  const usernames = new Map<string, string | null>();
  try {
    const pb = await createPocketbaseAdminClient();
    const profiles = await pb.collection("profiles").getList(1, ids.length, {
      filter: ids.map((id) => pb.filter("userId = {:id}", { id })).join(" || "),
      fields: "userId,username",
      skipTotal: true,
    });
    for (const profile of profiles.items) usernames.set(profile.userId as string, (profile.username as string | null) || null);
  } catch {
    // Names are cosmetic: fall back to the short user id.
  }
  return shapeLedgerLeaderboard(ledger, userId, usernames);
}

export async function getHubLeaderboard(userId: string): Promise<HubLeaderboardData> {
  const fromLedger = await getLedgerHubLeaderboard(userId);
  if (fromLedger) return fromLedger;
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
