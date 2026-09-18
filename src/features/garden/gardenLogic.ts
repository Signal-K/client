import type { ProjectType } from "@/src/features/onboarding/hubState";
import {
  CATALOG,
  structureById,
  type StructureId,
} from "./catalog";

export interface StructureRecord {
  tier: number;
  locked: boolean;
  buildable?: boolean;
  tendedAt: number;
  ready: boolean;
  readyAt: number;
}

export interface FlightRecord {
  status: "away" | "home";
  sentAt: number;
  eta: number;
}

export interface GardenState {
  credits: number;
  structures: Record<StructureId, StructureRecord>;
  flights: Partial<Record<StructureId, FlightRecord>>;
  hydroTick: number;
}

export const GARDEN_STORAGE_KEY = "ssc.garden.v3";

/** Instruments the player spends credits to raise after picking projects. */
export const BUILDABLE_STRUCTURE_IDS: StructureId[] = [
  "ssc.structure.telescope",
  "ssc.structure.satellite",
  "ssc.structure.solar",
  "ssc.structure.rover",
];

const PROJECT_TO_STRUCTURE: Record<ProjectType, StructureId> = {
  "planet-hunting": "ssc.structure.telescope",
  "asteroid-hunting": "ssc.structure.telescope",
  "cloud-tracking": "ssc.structure.satellite",
  "ice-tracking": "ssc.structure.satellite",
  "rover-training": "ssc.structure.rover",
  "solar-monitoring": "ssc.structure.solar",
};

const INVENTORY_ITEM_TO_STRUCTURE: Record<number, StructureId> = {
  12: "ssc.structure.telescope",
  14: "ssc.structure.telescope",
  3103: "ssc.structure.telescope",
  31013: "ssc.structure.telescope",
  24: "ssc.structure.satellite",
  32: "ssc.structure.satellite",
  3105: "ssc.structure.satellite",
  31012: "ssc.structure.satellite",
  23: "ssc.structure.rover",
};

const AUTOMATON_TO_STRUCTURE: Record<string, StructureId> = {
  Telescope: "ssc.structure.telescope",
  TelescopePlanet: "ssc.structure.telescope",
  TelescopeSolar: "ssc.structure.solar",
  Satellite: "ssc.structure.satellite",
  WeatherSatellite: "ssc.structure.satellite",
  Rover: "ssc.structure.rover",
};

/** Inventory ids that represent raised instruments. 3103 is mineral research cargo, not a plot. */
export const ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS = Object.keys(INVENTORY_ITEM_TO_STRUCTURE)
  .map(Number)
  .filter((id) => id !== 3103);

export const AUTOMATON_STRUCTURE_NAMES = Object.keys(AUTOMATON_TO_STRUCTURE);

export function gardenStorageKey(userId?: string | null): string {
  return userId ? `${GARDEN_STORAGE_KEY}:${userId}` : GARDEN_STORAGE_KEY;
}

export function emptyStructureRecord(id: StructureId): StructureRecord {
  const def = structureById(id);
  const deferred = !!def?.locked;
  const needsBuild = !!def?.buildCost;
  return {
    tier: deferred || needsBuild ? 0 : def?.startTier || 1,
    locked: deferred || needsBuild,
    buildable: false,
    tendedAt: 0,
    ready: !deferred && !needsBuild && !!def?.minigame,
    readyAt: 0,
  };
}

export function defaultGardenState(): GardenState {
  const structures = {} as Record<StructureId, StructureRecord>;
  for (const s of CATALOG.structures) {
    structures[s.id] = emptyStructureRecord(s.id);
  }
  return {
    credits: 80,
    structures,
    flights: {},
    hydroTick: Date.now(),
  };
}

export function structuresForProjects(interests: ProjectType[]): StructureId[] {
  const ids = new Set<StructureId>();
  for (const project of interests) {
    const id = PROJECT_TO_STRUCTURE[project];
    if (id) ids.add(id);
  }
  return [...ids];
}

export function projectsForStructures(ids: StructureId[]): ProjectType[] {
  const projects: ProjectType[] = [];
  const seen = new Set<ProjectType>();
  for (const [project, structureId] of Object.entries(PROJECT_TO_STRUCTURE) as [ProjectType, StructureId][]) {
    if (!ids.includes(structureId) || seen.has(project)) continue;
    // One representative project per structure is enough to re-arm plots.
    if (
      (structureId === "ssc.structure.telescope" && project !== "planet-hunting") ||
      (structureId === "ssc.structure.satellite" && project !== "cloud-tracking")
    ) {
      continue;
    }
    seen.add(project);
    projects.push(project);
  }
  return projects;
}

export function structuresFromInventoryItems(itemIds: number[]): StructureId[] {
  const ids = new Set<StructureId>();
  for (const item of itemIds) {
    if (!ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS.includes(item)) continue;
    const id = INVENTORY_ITEM_TO_STRUCTURE[item];
    if (id) ids.add(id);
  }
  return [...ids];
}

export function structuresFromAutomatons(automatons: string[]): StructureId[] {
  const ids = new Set<StructureId>();
  for (const name of automatons) {
    const id = AUTOMATON_TO_STRUCTURE[name];
    if (id) ids.add(id);
  }
  return [...ids];
}

export function applyProjectRoster(state: GardenState, interests: ProjectType[]): GardenState {
  const wanted = new Set(structuresForProjects(interests));
  const structures = { ...state.structures };
  for (const id of BUILDABLE_STRUCTURE_IDS) {
    const rec = structures[id];
    if (!rec) continue;
    if (!rec.locked) continue;
    structures[id] = { ...rec, buildable: wanted.has(id) };
  }
  return { ...state, structures };
}

export function seedOwnedStructures(state: GardenState, owned: StructureId[]): GardenState {
  if (!owned.length) return state;
  const structures = { ...state.structures };
  for (const id of owned) {
    const def = structureById(id);
    const rec = structures[id];
    if (!def || !rec) continue;
    structures[id] = {
      ...rec,
      locked: false,
      buildable: false,
      tier: rec.tier > 0 ? rec.tier : def.startTier,
      ready: !!def.minigame,
    };
  }
  return { ...state, structures };
}

export type BuildResult =
  | { ok: true; state: GardenState }
  | { ok: false; reason: "locked" | "unlisted" | "built" | "credits"; cost: number };

export function buildStructure(state: GardenState, id: StructureId): BuildResult {
  const def = structureById(id);
  const rec = state.structures[id];
  const cost = def?.buildCost ?? 0;
  if (!def || !rec) return { ok: false, reason: "unlisted", cost };
  if (!def.buildCost) return { ok: false, reason: "unlisted", cost };
  if (!rec.locked) return { ok: false, reason: "built", cost };
  if (!rec.buildable) return { ok: false, reason: "locked", cost };
  if (state.credits < cost) return { ok: false, reason: "credits", cost };
  return {
    ok: true,
    state: {
      ...state,
      credits: state.credits - cost,
      structures: {
        ...state.structures,
        [id]: {
          ...rec,
          locked: false,
          buildable: false,
          tier: def.startTier,
          ready: !!def.minigame,
          readyAt: 0,
        },
      },
    },
  };
}

export function isPlot(rec: StructureRecord | undefined): boolean {
  return !!rec?.locked && !!rec?.buildable;
}

/** Untouched v1 gardens spawned every instrument already built. Discard those. */
export function isUntouchedLegacyGarden(parsed: Partial<GardenState> | null | undefined): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  if (parsed.credits !== 80) return false;
  const telescope = parsed.structures?.["ssc.structure.telescope"];
  if (!telescope || telescope.locked) return false;
  if ((telescope.tier ?? 0) !== 1) return false;
  const records = Object.values(parsed.structures || {});
  if (records.some((rec) => rec.tendedAt)) return false;
  const flights = parsed.flights ? Object.keys(parsed.flights) : [];
  return flights.length === 0;
}

export function hydrateGardenState(parsed: unknown): GardenState {
  const base = defaultGardenState();
  if (!parsed || typeof parsed !== "object") return base;
  const garden = parsed as Partial<GardenState>;
  if (isUntouchedLegacyGarden(garden)) return base;
  return {
    ...base,
    ...garden,
    structures: { ...base.structures, ...(garden.structures || {}) },
    flights: garden.flights || {},
  };
}

export function isPristineGarden(state: GardenState | null | undefined): boolean {
  if (!state) return true;
  const fresh = defaultGardenState();
  if (state.credits !== fresh.credits) return false;
  if (Object.keys(state.flights || {}).length) return false;
  for (const def of CATALOG.structures) {
    const rec = state.structures[def.id];
    const base = fresh.structures[def.id];
    if (!rec) continue;
    if (rec.locked !== base.locked) return false;
    if (rec.tier !== base.tier) return false;
    if (rec.buildable) return false;
    if (rec.tendedAt) return false;
  }
  return true;
}

export function hasRaisedInstrument(state: GardenState | null | undefined): boolean {
  if (!state) return false;
  return BUILDABLE_STRUCTURE_IDS.some((id) => state.structures[id] && !state.structures[id].locked);
}

export type GardenLesson = "raise" | "classify" | "hop" | null;

/** Short first-session: raise one instrument, classify once, then offer a hop. */
export function gardenLesson(args: {
  state: GardenState;
  coachDone: boolean;
  classifiedThisVisit: boolean;
  classificationCount: number;
}): GardenLesson {
  if (args.coachDone) return null;
  if (!hasRaisedInstrument(args.state)) return "raise";
  if (!args.classifiedThisVisit && args.classificationCount < 1) return "classify";
  return "hop";
}

export function shouldAskForProjectRoster(args: {
  prefsLoading: boolean;
  accountLoading: boolean;
  needsPreferencesPrompt: boolean;
  returning: boolean;
  hasInterests?: boolean;
  hasRaisedInstrument?: boolean;
}): boolean {
  if (args.prefsLoading || args.accountLoading) return false;
  if (args.hasRaisedInstrument) return false;
  if (args.returning) return false;
  return args.needsPreferencesPrompt;
}
