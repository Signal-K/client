import { defaultOnboarding, type HubOnboarding } from "../onboarding/hubState";
import { GARDEN_GENERATION, restartedGarden, type GardenState } from "./gardenLogic";

export interface LegacyHubRow {
  onboarding?: unknown;
  garden?: unknown;
  legacyArchive?: unknown;
}

export interface LegacyArchive {
  archivedAt: string;
  /** Generation of the garden that was archived; 0 when it predates generations. */
  fromGeneration: number;
  onboarding: unknown;
  garden: unknown;
}

export interface HubMigration {
  onboarding: HubOnboarding;
  garden: GardenState;
  legacyArchive: LegacyArchive;
}

function generationOf(garden: unknown): number {
  if (!garden || typeof garden !== "object") return 0;
  const value = (garden as { generation?: unknown }).generation;
  return typeof value === "number" ? value : 0;
}

/**
 * Restart one account at the beginning of the redesigned garden. The previous onboarding
 * and garden are kept verbatim in `legacyArchive`; only credits carry into the new garden.
 * Returns null when the row is already migrated, so the script is safe to re-run.
 */
export function migrateHubRow(row: LegacyHubRow, now: Date = new Date()): HubMigration | null {
  if (row.legacyArchive) return null;
  if (generationOf(row.garden) >= GARDEN_GENERATION) return null;
  return {
    onboarding: defaultOnboarding(),
    garden: restartedGarden(row.garden as { credits?: unknown } | null),
    legacyArchive: {
      archivedAt: now.toISOString(),
      fromGeneration: generationOf(row.garden),
      onboarding: row.onboarding ?? null,
      garden: row.garden ?? null,
    },
  };
}
