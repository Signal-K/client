// SSL-784: the hub leaderboard read from the shared platform_contributions
// ledger (via the shared backend's GET /api/platform/leaderboard) instead of
// the old profiles.classificationPoints.
//
// One request returns the top five and the caller's own score and rank; the
// shared backend caches the aggregate for a minute. Usernames are the only
// other read: one profiles query for at most six ids.

export interface LedgerLeaderboardResponse {
  top: { userId: string; score: number }[];
  me?: { userId: string; score: number; rank: number };
}

export interface LedgerLeaderboardConfig {
  url: string;
  key: string;
}

/** The shared backend settings, or null when this deployment has none (the old score is used). */
export function ledgerLeaderboardConfig(env: Record<string, string | undefined> = process.env): LedgerLeaderboardConfig | null {
  const url = env.SHARED_POCKETBASE_URL?.trim().replace(/\/$/, "");
  const key = env.SHARED_INTERNAL_API_KEY?.trim();
  return url && key ? { url, key } : null;
}

/** Null on any failure or an empty ledger, so the caller can fall back. Never throws. */
export async function fetchLedgerLeaderboard(
  userId: string,
  config: LedgerLeaderboardConfig | null = ledgerLeaderboardConfig(),
  fetcher: typeof fetch = fetch,
): Promise<LedgerLeaderboardResponse | null> {
  if (!config) return null;
  try {
    const response = await fetcher(
      `${config.url}/api/platform/leaderboard?limit=5&userId=${encodeURIComponent(userId)}`,
      { headers: { "X-Internal-Api-Key": config.key } },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as LedgerLeaderboardResponse;
    return Array.isArray(body?.top) && body.top.length > 0 ? body : null;
  } catch {
    return null;
  }
}

export interface LeaderboardRow {
  rank: number;
  username: string;
  score: number;
  isCurrentUser?: boolean;
}

const displayName = (userId: string, username?: string | null) => username || `User ${userId.slice(0, 6)}`;

/** Turn a ledger answer and a userId->username map into the rows the hub shows. */
export function shapeLedgerLeaderboard(
  ledger: LedgerLeaderboardResponse,
  userId: string,
  usernames: Map<string, string | null | undefined>,
) {
  // Ties share a rank, as they do in `me.rank`.
  const entries: LeaderboardRow[] = ledger.top.map((row) => {
    const rank = ledger.top.findIndex((other) => other.score === row.score) + 1;
    return {
      rank,
      username: displayName(row.userId, usernames.get(row.userId)),
      score: row.score,
      isCurrentUser: row.userId === userId,
    };
  });
  const me = ledger.me && ledger.me.score > 0 ? ledger.me : null;
  const currentUser: LeaderboardRow | null =
    me && !entries.some((entry) => entry.isCurrentUser)
      ? { rank: me.rank, username: displayName(userId, usernames.get(userId)), score: me.score, isCurrentUser: true }
      : null;
  return { entries, currentUser };
}

/** Every user id the shaped rows will need a name for. */
export function ledgerUserIds(ledger: LedgerLeaderboardResponse, userId: string): string[] {
  return [...new Set([...ledger.top.map((row) => row.userId), userId])];
}
