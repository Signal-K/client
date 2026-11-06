// SSL-783: pure helpers for moving old `profiles.classificationPoints` into the
// platform_contributions ledger. Kept apart from the script so they can be tested.

export const LEGACY_POINTS_GAME = "garden";
export const LEGACY_POINTS_KIND = "legacy-classification-points";
export const LEGACY_POINTS_PROJECT = "legacy";
// A sentinel day long before any real play, so a month or "previous month"
// count never includes the migrated total.
export const LEGACY_POINTS_DAY = "2000-01-01";
export const LEDGER_MAX_BATCH = 200;
export const LEDGER_MAX_POINTS = 1_000_000;

export interface LegacyProfile {
  userId?: string | null;
  classificationPoints?: number | null;
}

export interface LedgerPointsRow {
  userId: string;
  game: string;
  kind: string;
  day: string;
  points: number;
  project: string;
}

/** One row per profile with a positive whole-number total. Anything else is skipped and counted. */
export function buildLegacyPointsRows(profiles: LegacyProfile[]) {
  const rows: LedgerPointsRow[] = [];
  const skipped = { noUser: 0, noPoints: 0 };
  const seen = new Set<string>();
  for (const profile of profiles) {
    const userId = String(profile.userId ?? "").trim();
    if (!userId || userId.length > 128) {
      skipped.noUser += 1;
      continue;
    }
    const points = Math.floor(Number(profile.classificationPoints ?? 0));
    if (!Number.isFinite(points) || points < 1) {
      skipped.noPoints += 1;
      continue;
    }
    // Two profiles for one Clerk id would collide on the ledger's unique key.
    if (seen.has(userId)) {
      skipped.noUser += 1;
      continue;
    }
    seen.add(userId);
    rows.push({
      userId,
      game: LEGACY_POINTS_GAME,
      kind: LEGACY_POINTS_KIND,
      day: LEGACY_POINTS_DAY,
      points: Math.min(points, LEDGER_MAX_POINTS),
      project: LEGACY_POINTS_PROJECT,
    });
  }
  return { rows, skipped };
}

export function chunk<T>(items: T[], size = LEDGER_MAX_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
