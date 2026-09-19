/**
 * SSC naming catalog — public ids for the garden hub.
 * Ported from signal-k/tickets-please `workspace/projects/ssc/garden-mockup/js/catalog.js`.
 * Keep this file and that one in sync — the naming doc says catalog wins if prose and code disagree.
 */

export type StructureId =
  | "ssc.structure.habitat"
  | "ssc.structure.hydro"
  | "ssc.structure.telescope"
  | "ssc.structure.satellite"
  | "ssc.structure.solar"
  | "ssc.structure.pad"
  | "ssc.structure.probe"
  | "ssc.structure.rover";

export type MinigameId =
  | "ssc.minigame.planet_hunters"
  | "ssc.minigame.clouds"
  | "ssc.minigame.solar"
  | "ssc.minigame.probe_return"
  | "ssc.minigame.supply"
  | "ssc.minigame.rover";

export type HopId = "ssc.hop.landnam" | "ssc.hop.spectra" | "ssc.hop.garden";

export interface GrowthStage {
  tier: number;
  sprite: string;
  capacity: Record<string, unknown> & { label: string };
  readyMs: number;
}

export interface StructureDef {
  id: StructureId;
  slug: string;
  name: string;
  verb: string;
  blurb: string;
  minigame: MinigameId | null;
  hop: HopId | null;
  startTier: number;
  locked: boolean;
  /** Credits to raise this instrument from a plot. Camp structures omit this. */
  buildCost?: number;
  growth: GrowthStage[];
}

export interface MinigameDef {
  id: MinigameId;
  name: string;
  structure: StructureId;
  reward: number;
  hop: HopId | null;
  classifyIn: "sky" | null;
  cost?: number;
  flightMs?: number;
  deferred?: boolean;
}

export interface HopDef {
  id: HopId;
  label: string;
  href: string;
  blurb: string;
}

const LANDNAM = "https://playlandnam.space";
const GARDEN = "https://starsailors.space/game";
/** Native Spectra Outpost. Empty until NEXT_PUBLIC_SPECTRA_URL is set (KES-417). */
const SPECTRA = process.env.NEXT_PUBLIC_SPECTRA_URL || "";
const READY_MS = [0, 20000, 14000, 9000];

const MINIGAMES: Record<MinigameId, MinigameDef> = {
  "ssc.minigame.planet_hunters": {
    id: "ssc.minigame.planet_hunters",
    name: "Planet Hunters",
    structure: "ssc.structure.telescope",
    reward: 12,
    hop: "ssc.hop.landnam",
    classifyIn: "sky",
  },
  "ssc.minigame.clouds": {
    id: "ssc.minigame.clouds",
    name: "Cloud Watch",
    structure: "ssc.structure.satellite",
    reward: 8,
    hop: null,
    classifyIn: "sky",
  },
  "ssc.minigame.solar": {
    id: "ssc.minigame.solar",
    name: "Sunspots",
    structure: "ssc.structure.solar",
    reward: 8,
    hop: null,
    classifyIn: "sky",
  },
  "ssc.minigame.probe_return": {
    id: "ssc.minigame.probe_return",
    name: "Probe flight",
    structure: "ssc.structure.probe",
    reward: 16,
    flightMs: 32000,
    hop: null,
    classifyIn: "sky",
  },
  "ssc.minigame.supply": {
    id: "ssc.minigame.supply",
    name: "Supply run",
    structure: "ssc.structure.pad",
    reward: 14,
    cost: 10,
    flightMs: 28000,
    hop: "ssc.hop.landnam",
    classifyIn: "sky",
  },
  "ssc.minigame.rover": {
    id: "ssc.minigame.rover",
    name: "AI4Mars",
    structure: "ssc.structure.rover",
    reward: 10,
    hop: null,
    classifyIn: "sky",
  },
};

function stages(rows: [number, string, Record<string, unknown> & { label: string }][]): GrowthStage[] {
  return rows.map(([tier, sprite, capacity]) => ({
    tier,
    sprite,
    capacity,
    readyMs: READY_MS[tier] || 0,
  }));
}

export const CATALOG = {
  currency: {
    id: "ssc.currency.credits" as const,
    label: "CR",
    name: "Credits",
  },
  sky: {
    id: "ssc.sky.cycle" as const,
    shootingStar: { id: "ssc.sky.shooting_star" as const },
    ambientLaunch: { id: "ssc.sky.ambient_launch" as const },
    subject: { id: "ssc.sky.subject" as const },
  },
  sandbox: { id: "ssc.sandbox.garden" as const },
  flow: {
    panel: {
      id: "ssc.flow.panel" as const,
      blurb: "Camp verbs sit on a compact chip. Instruments open in the sky. Never a sparse sidebar.",
    },
    skyClassify: {
      id: "ssc.flow.sky_classify" as const,
      blurb: "Classification plays in the sky area. The camp stays visible.",
    },
  },
  upgrade: {
    id: "ssc.upgrade.structure_tier" as const,
    maxTier: 3,
    costs: [0, 40, 90],
    readyMs: READY_MS,
    blurb: "Growth stages. More sprite, more capacity — not a bigger copy of the same silhouette.",
  },
  hops: {
    landnam: {
      id: "ssc.hop.landnam" as const,
      label: "Landnam",
      href: LANDNAM,
      blurb: "The long-session game. Rockets, mining, TESS — not this garden.",
    } satisfies HopDef,
    spectra: {
      id: "ssc.hop.spectra" as const,
      label: "Spectra",
      href: SPECTRA,
      blurb: "Weekly scrap-yard. Machine-tend stations there — watering these beds is a different verb.",
    } satisfies HopDef,
    garden: {
      id: "ssc.hop.garden" as const,
      label: "Garden",
      href: GARDEN,
      blurb: "This camp. Other games link back here.",
    } satisfies HopDef,
  },
  structures: [
    {
      id: "ssc.structure.habitat",
      slug: "habitat",
      name: "Habitat",
      verb: "Home",
      blurb: "A small greenhouse on the dirt. Camp home — not a dome over the plain.",
      minigame: null,
      hop: null,
      startTier: 1,
      locked: false,
      growth: stages([
        [1, "habitat-t1", { idleBonus: 0, label: "Small greenhouse" }],
        [2, "habitat-t2", { idleBonus: 1, label: "Taller glass, more plants" }],
        [3, "habitat-t3", { idleBonus: 2, label: "Lush annex" }],
      ]),
    },
    {
      id: "ssc.structure.hydro",
      slug: "hydro",
      name: "Garden beds",
      verb: "Water",
      blurb: "Water the beds so CR ticks here. Spectra machine-tending is a different hop.",
      minigame: null,
      hop: "ssc.hop.spectra",
      startTier: 1,
      locked: false,
      growth: stages([
        [1, "hydro-t1", { beds: 2, label: "Two beds" }],
        [2, "hydro-t2", { beds: 4, label: "Four beds" }],
        [3, "hydro-t3", { beds: 6, label: "Six beds" }],
      ]),
    },
    {
      id: "ssc.structure.telescope",
      slug: "telescope",
      name: "Telescope",
      verb: "Point",
      blurb: "One project: Planet Hunters. A dip on the curve is the arrival. Hop Landnam for the long session.",
      minigame: "ssc.minigame.planet_hunters",
      hop: "ssc.hop.landnam",
      startTier: 1,
      locked: false,
      buildCost: 24,
      growth: stages([
        [1, "telescope-t1", { subjects: 1, label: "Small dome" }],
        [2, "telescope-t2", { subjects: 1, label: "Longer barrel" }],
        [3, "telescope-t3", { subjects: 1, label: "Dome plus annex" }],
      ]),
    },
    {
      id: "ssc.structure.satellite",
      slug: "satellite",
      name: "Satellite",
      verb: "Scan",
      blurb: "One project: Cloud Watch. Classify the shape, then let the dish sit.",
      minigame: "ssc.minigame.clouds",
      hop: null,
      startTier: 1,
      locked: false,
      buildCost: 18,
      growth: stages([
        [1, "satellite-t1", { subjects: 1, label: "Small dish" }],
        [2, "satellite-t2", { subjects: 1, label: "Wider dish" }],
        [3, "satellite-t3", { subjects: 1, label: "Dual dish" }],
      ]),
    },
    {
      id: "ssc.structure.solar",
      slug: "solar",
      name: "Solar",
      verb: "Watch",
      blurb: "One project: Sunspots. Count the groups, then leave the panels in the light.",
      minigame: "ssc.minigame.solar",
      hop: null,
      startTier: 1,
      locked: false,
      buildCost: 18,
      growth: stages([
        [1, "solar-t1", { panels: 1, label: "One panel" }],
        [2, "solar-t2", { panels: 2, label: "Two panels" }],
        [3, "solar-t3", { panels: 3, label: "Three-panel array" }],
      ]),
    },
    {
      id: "ssc.structure.pad",
      slug: "pad",
      name: "Pad",
      verb: "Send",
      blurb: "A hull on dirt. Send a crate when you mean it. Other players' classify work flies from here too.",
      minigame: "ssc.minigame.supply",
      hop: "ssc.hop.landnam",
      startTier: 1,
      locked: false,
      growth: stages([
        [1, "pad-t1", { hull: "small", label: "Dirt pad and small lander" }],
        [2, "pad-t2", { hull: "marked", label: "Marked pad" }],
        [3, "pad-t3", { hull: "fat", label: "Fatter hull" }],
      ]),
    },
    {
      id: "ssc.structure.probe",
      slug: "probe",
      name: "Probe",
      verb: "Dispatch",
      blurb: "Send the little ship. Wait. Collect the pile when it comes home.",
      minigame: "ssc.minigame.probe_return",
      hop: null,
      startTier: 1,
      locked: false,
      growth: stages([
        [1, "probe-t1", { legs: 2, label: "Tripod" }],
        [2, "probe-t2", { legs: 2, label: "Extra antenna" }],
        [3, "probe-t3", { legs: 3, label: "Extra leg" }],
      ]),
    },
    {
      id: "ssc.structure.rover",
      slug: "rover",
      name: "Rover",
      verb: "Label",
      blurb: "One project: AI4Mars. Raise the rover, then label terrain in the sky.",
      minigame: "ssc.minigame.rover",
      hop: null,
      startTier: 1,
      locked: false,
      buildCost: 20,
      growth: stages([
        [1, "rover-t1", { labels: 1, label: "Small rover" }],
        [2, "rover-t2", { labels: 1, label: "Mast cam" }],
        [3, "rover-t3", { labels: 1, label: "Science deck" }],
      ]),
    },
  ] satisfies StructureDef[],
  minigames: MINIGAMES,
};

const ID_RE = /^ssc\.(structure|minigame|hop|currency|upgrade|sky|sandbox|flow)\.[a-z][a-z0-9_]*$/;

export function allIds(): string[] {
  const ids: string[] = [
    CATALOG.currency.id,
    CATALOG.sky.id,
    CATALOG.sky.shootingStar.id,
    CATALOG.sky.ambientLaunch.id,
    CATALOG.sky.subject.id,
    CATALOG.sandbox.id,
    CATALOG.flow.panel.id,
    CATALOG.flow.skyClassify.id,
    CATALOG.upgrade.id,
    CATALOG.hops.landnam.id,
    CATALOG.hops.spectra.id,
    CATALOG.hops.garden.id,
  ];
  for (const s of CATALOG.structures) ids.push(s.id);
  for (const key of Object.keys(CATALOG.minigames)) ids.push(key);
  return ids;
}

export function assertNaming(): number {
  const ids = allIds();
  const seen = new Set<string>();
  const bad: string[] = [];
  for (const id of ids) {
    if (!ID_RE.test(id)) bad.push("shape: " + id);
    if (seen.has(id)) bad.push("dup: " + id);
    seen.add(id);
  }
  for (const s of CATALOG.structures) {
    if (s.minigame && !CATALOG.minigames[s.minigame]) {
      bad.push("missing minigame for " + s.id);
    }
    if (s.locked) {
      if (s.growth.length) bad.push("locked growth: " + s.id);
    } else if (!s.growth || s.growth.length !== CATALOG.upgrade.maxTier) {
      bad.push("growth stages: " + s.id);
    }
  }
  for (const mg of Object.values(CATALOG.minigames)) {
    const host = CATALOG.structures.find((s) => s.id === mg.structure);
    if (!host) bad.push("minigame host missing: " + mg.id);
    if (!mg.deferred && mg.classifyIn !== "sky") {
      bad.push("classifyIn sky: " + mg.id);
    }
  }
  if (bad.length) {
    throw new Error("SSC catalog naming failed:\n" + bad.join("\n"));
  }
  return ids.length;
}

export function structureById(id: string | null | undefined): StructureDef | null {
  return CATALOG.structures.find((s) => s.id === id) || null;
}

export function hopById(id: string | null | undefined): HopDef | null {
  return Object.values(CATALOG.hops).find((h) => h.id === id) || null;
}

export function hopRail(): HopDef[] {
  return [CATALOG.hops.garden, CATALOG.hops.landnam, CATALOG.hops.spectra];
}

/** Append `from=garden` so Landnam / Spectra can grant a return bonus. */
export function outboundHopUrl(hop: HopDef): string | null {
  if (!hop.href) return null;
  if (hop.id === "ssc.hop.garden") return hop.href;
  try {
    const url = new URL(hop.href);
    url.searchParams.set("from", "garden");
    return url.toString();
  } catch {
    return hop.href;
  }
}

export function hopSlugFromReturnParam(value: string | null | undefined): "ssc.hop.landnam" | "ssc.hop.spectra" | null {
  if (value === "landnam") return "ssc.hop.landnam";
  if (value === "spectra") return "ssc.hop.spectra";
  return null;
}

export function growthFor(structure: StructureDef | null, tier: number): GrowthStage | null {
  if (!structure || !structure.growth) return null;
  return structure.growth.find((g) => g.tier === tier) || null;
}
