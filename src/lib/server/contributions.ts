import type PocketBase from "pocketbase";

import {
  CONTRIBUTIONS_COLLECTION,
  buildContributionRecord,
  type ContributionKind,
  type ContributionResult,
} from "@/src/lib/gameplay/contributions";

// Skip repeats without touching PocketBase. A Worker isolate lives for many
// requests, so a player who classifies ten frames pays for one write, not ten.
// The unique (userId, game, kind, day) key still catches anything this misses.
const seen = new Set<string>();
const MAX_SEEN = 5000;

// If the table is not deployed yet, stop asking for a minute instead of paying
// one failed subrequest per classification.
const UNAVAILABLE_BACKOFF_MS = 60_000;
let unavailableUntil = 0;

/** Test hook: forget what this isolate has already reported. */
export function resetContributionMemo() {
  seen.clear();
  unavailableUntil = 0;
}

/**
 * Report one contribution. Best effort: this never throws and never blocks the
 * action that triggered it. At most one PocketBase write, and no reads.
 */
export async function recordContribution(
  pb: PocketBase,
  userId: string,
  kind: ContributionKind,
  at: number = Date.now()
): Promise<ContributionResult> {
  if (!userId) return "unavailable";
  if (at < unavailableUntil) return "unavailable";

  const record = buildContributionRecord(userId, kind, at);
  const key = `${record.userId}|${record.game}|${record.kind}|${record.day}`;
  if (seen.has(key)) return "duplicate";

  try {
    await pb.collection(CONTRIBUTIONS_COLLECTION).create(record);
    remember(key);
    return "recorded";
  } catch (error) {
    const status = (error as { status?: number })?.status;
    // 400 is the unique key: already counted today. Remember it.
    if (status === 400) {
      remember(key);
      return "duplicate";
    }
    // 404: the collection is not deployed yet. Anything else: back off briefly too.
    unavailableUntil = at + UNAVAILABLE_BACKOFF_MS;
    return "unavailable";
  }
}

function remember(key: string) {
  if (seen.size >= MAX_SEEN) seen.clear();
  seen.add(key);
}
