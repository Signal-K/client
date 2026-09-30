import { readPage, type PocketbaseEnv } from "./pocketbase";

// GET /api/v1/research/summary: the Worker version of the Next route of the same
// purpose. Light by design: five small PocketBase reads in the common case (fewer
// when the player has no referral code), no row downloads beyond a few short
// fields, and the client shares one request between screens.

const QUANTITY_UPGRADES = ["probereceptors", "satellitecount", "roverwaypoints"];
const TYPE_PAGE = 500;
const quote = (value: string) => `"${value.replace(/["\\]/g, "")}"`;

type Counts = { all: number; asteroid: number; cloud: number; planet: number };

export const emptySummary = () => ({
  authenticated: false,
  userId: null,
  researchedEntries: [],
  researchedTechTypes: [],
  referralCode: null,
  referralCount: 0,
  referralBonus: 0,
  surveyBonus: 0,
  counts: { all: 0, asteroid: 0, cloud: 0, planet: 0 },
  availableStardust: 0,
  upgrades: {
    telescopeReceptors: 1,
    satelliteCount: 1,
    roverWaypoints: 4,
    spectroscopyUnlocked: false,
    findMineralsUnlocked: false,
    p4MineralsUnlocked: false,
    roverExtractionUnlocked: false,
    satelliteExtractionUnlocked: false,
    ngtsAccessUnlocked: false,
  },
  skillTree: { classifiedPlanets: 0, discoveredAsteroids: 0, unlockedSkills: [] as string[] },
});

// One request returns every classification's type plus the exact total. Only a
// player with more than TYPE_PAGE classifications needs the per-type fallback.
async function classificationCounts(env: PocketbaseEnv, userId: string, fetchImpl?: typeof fetch): Promise<Counts> {
  const base = `author=${quote(userId)}`;
  const { items, totalItems } = await readPage<{ classificationtype: string }>(
    env,
    "ss_classifications",
    { filter: base, perPage: TYPE_PAGE, fields: "classificationtype", withTotal: true },
    fetchImpl,
  );
  if (totalItems <= items.length) {
    const count = (type: string) => items.filter((row) => row.classificationtype === type).length;
    return { all: totalItems, asteroid: count("telescope-minorPlanet"), cloud: count("cloud"), planet: count("planet") };
  }
  const exact = async (type: string) =>
    (await readPage(env, "ss_classifications", { filter: `${base}&&classificationtype=${quote(type)}`, perPage: 1, fields: "id", withTotal: true }, fetchImpl)).totalItems;
  const [asteroid, cloud, planet] = await Promise.all([exact("telescope-minorPlanet"), exact("cloud"), exact("planet")]);
  return { all: totalItems, asteroid, cloud, planet };
}

export async function buildResearchSummary(env: PocketbaseEnv, userId: string, fetchImpl?: typeof fetch) {
  const owner = `userId=${quote(userId)}`;
  const [researched, surveys, profile, counts] = await Promise.all([
    readPage<{ techType: string; createdAt: string | null }>(
      env,
      "researched",
      { filter: owner, sort: "+createdAt,+legacyId", perPage: 500, fields: "techType,createdAt" },
      fetchImpl,
    ),
    readPage<{ stardustGranted: number | null }>(env, "survey_rewards", { filter: owner, perPage: 500, fields: "stardustGranted" }, fetchImpl),
    readPage<{ referralCode: string | null }>(env, "profiles", { filter: owner, perPage: 1, fields: "referralCode" }, fetchImpl),
    classificationCounts(env, userId, fetchImpl),
  ]);

  const referralCode = profile.items[0]?.referralCode || null;
  const referralCount = referralCode
    ? (await readPage(env, "referrals", { filter: `referralCode=${quote(referralCode)}`, perPage: 1, fields: "id", withTotal: true }, fetchImpl)).totalItems
    : 0;

  const rows = researched.items.filter((row) => row.techType);
  const techTypes = rows.map((row) => row.techType);
  const techSet = new Set(techTypes);
  const surveyBonus = surveys.items.reduce((total, row) => total + (row.stardustGranted ?? 0), 0);
  const penalty = techTypes.reduce((total, tech) => total + (QUANTITY_UPGRADES.includes(tech) ? 10 : 2), 0);
  const upgradesOf = (tech: string) => techTypes.filter((t) => t === tech).length;
  const skills = ["planet-hunters", "asteroid-hunting", "planet-exploration", "cloudspotting", "active-asteroids"];
  const unlockedSkills = Array.from(new Set(techTypes.filter((tech) => skills.includes(tech))));

  return {
    authenticated: true,
    userId,
    researchedEntries: rows.map((row) => ({ tech_type: row.techType, created_at: row.createdAt ?? null })),
    researchedTechTypes: techTypes,
    referralCode,
    referralCount,
    referralBonus: referralCount * 5,
    surveyBonus,
    counts,
    availableStardust: Math.max(0, counts.all + surveyBonus - penalty),
    upgrades: {
      telescopeReceptors: 1 + upgradesOf("probereceptors"),
      satelliteCount: 1 + upgradesOf("satellitecount"),
      roverWaypoints: 4 + upgradesOf("roverwaypoints") * 2,
      spectroscopyUnlocked: techSet.has("spectroscopy"),
      findMineralsUnlocked: techSet.has("findMinerals"),
      p4MineralsUnlocked: techSet.has("p4Minerals"),
      roverExtractionUnlocked: techSet.has("roverExtraction"),
      satelliteExtractionUnlocked: techSet.has("satelliteExtraction"),
      ngtsAccessUnlocked: techSet.has("ngtsAccess"),
    },
    skillTree: {
      classifiedPlanets: counts.planet,
      discoveredAsteroids: counts.asteroid,
      unlockedSkills,
    },
  };
}
