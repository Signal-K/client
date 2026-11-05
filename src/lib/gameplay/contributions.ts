// SSC-48: the ecosystem contribution ledger (`platform_contributions` on the
// shared backend, tickets-please migration 109). One row means "this player did
// this kind of research in this game on this UTC day". Every game reports into
// the same table so the community garden can grow from the whole ecosystem.

export const CONTRIBUTIONS_COLLECTION = "platform_contributions";
export const CONTRIBUTION_GAME = "garden";

// Any kind of research can be reported: the ledger stores kind as bounded text
// so a new game or task never needs a deploy here. Kinds are lowercase words
// joined by hyphens, the shape Landnam's research stamps use. These are the
// ones in use today; anything else of the same shape is accepted too.
export const KNOWN_CONTRIBUTION_KINDS = [
  "classification",
  "survey",
  "discovery-mission",
  "event",
  "exchange-sale",
  "contract-run",
  "price-alert",
] as const;
export type ContributionKind = string;

const KIND_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const MAX_KIND_LENGTH = 64;
export const MAX_CONTRIBUTION_SCORE = 1_000_000_000;

export function isContributionKind(value: unknown): value is ContributionKind {
  return typeof value === "string" && value.length <= MAX_KIND_LENGTH && KIND_PATTERN.test(value);
}

/** A score is a whole number from 0 up. Anything else is dropped, not rejected. */
export function parseContributionScore(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const whole = Math.round(value);
  if (whole < 0) return undefined;
  return Math.min(whole, MAX_CONTRIBUTION_SCORE);
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
  /** Optional result for this kind that day (points, items, accuracy x100). */
  score?: number;
}

export function buildContributionRecord(
  userId: string,
  kind: ContributionKind,
  at: number,
  score?: number
): ContributionRecord {
  const record: ContributionRecord = { userId, game: CONTRIBUTION_GAME, kind, day: contributionDay(at) };
  const clean = parseContributionScore(score);
  if (clean !== undefined) record.score = clean;
  return record;
}

/** What the ledger can answer. `unavailable` never reaches the player. */
export type ContributionResult = "recorded" | "duplicate" | "unavailable";
