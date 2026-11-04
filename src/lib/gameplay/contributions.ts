// SSC-48: the ecosystem contribution ledger (`platform_contributions` on the
// shared backend, tickets-please migration 109). One row means "this player did
// this kind of research in this game on this UTC day". Every game reports into
// the same table so the community garden can grow from the whole ecosystem.

export const CONTRIBUTIONS_COLLECTION = "platform_contributions";
export const CONTRIBUTION_GAME = "garden";

// Same words as Landnám's research stamp kinds (web/lib/research/stamps.ts).
// Garden only produces these two; add a kind here when Garden grows a task for it.
export const CONTRIBUTION_KINDS = ["classification", "event"] as const;
export type ContributionKind = (typeof CONTRIBUTION_KINDS)[number];

export function isContributionKind(value: unknown): value is ContributionKind {
  return typeof value === "string" && (CONTRIBUTION_KINDS as readonly string[]).includes(value);
}

/** UTC day, YYYY-MM-DD. The server always picks the day; the client never sends one. */
export function contributionDay(at: number): string {
  return new Date(at).toISOString().slice(0, 10);
}

export interface ContributionRecord {
  userId: string;
  game: typeof CONTRIBUTION_GAME;
  kind: ContributionKind;
  day: string;
}

export function buildContributionRecord(userId: string, kind: ContributionKind, at: number): ContributionRecord {
  return { userId, game: CONTRIBUTION_GAME, kind, day: contributionDay(at) };
}

/** What the ledger can answer. `unavailable` never reaches the player. */
export type ContributionResult = "recorded" | "duplicate" | "unavailable";
