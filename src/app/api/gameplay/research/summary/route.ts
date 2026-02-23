import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

const QUANTITY_UPGRADES = ["probereceptors", "satellitecount", "roverwaypoints"];

export async function GET() {
  const { user, authError } = await getRouteUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [researched, classifications, surveyRewards] = await Promise.all([
    prisma.$queryRaw<Array<{ tech_type: string; created_at: string }>>`
      SELECT tech_type, created_at
      FROM researched
      WHERE user_id = ${userId}
    `,
    prisma.$queryRaw<Array<{ classificationtype: string }>>`
      SELECT classificationtype
      FROM classifications
      WHERE author = ${userId}
    `,
    prisma.$queryRaw<Array<{ stardust_granted: number }>>`
      SELECT stardust_granted
      FROM survey_rewards
      WHERE user_id = ${userId}::uuid
    `,
  ]);

  const profileRows = await prisma.$queryRaw<Array<{ referral_code: string | null }>>`
    SELECT referral_code
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1
  `;
  const referralCode = profileRows[0]?.referral_code ?? null;
  let referralCount = 0;
  if (referralCode) {
    const referralRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(*)::bigint AS count
      FROM referrals
      WHERE referral_code = ${referralCode}
    `;
    referralCount = Number(referralRows[0]?.count ?? 0);
  }
  const referralBonus = referralCount * 5;

  const researchedRows = researched;
  const classificationRows = classifications;

  const counts = {
    all: classificationRows.length,
    asteroid: 0,
    cloud: 0,
    planet: 0,
  };

  for (const row of classificationRows) {
    const type = row.classificationtype;
    if (type === "telescope-minorPlanet") counts.asteroid += 1;
    if (type === "cloud") counts.cloud += 1;
    if (type === "planet") counts.planet += 1;
  }

  const techTypes = researchedRows.map((r) => r.tech_type).filter(Boolean);
  const techSet = new Set(techTypes);

  const telescopeUpgrades = techTypes.filter((t) => t === "probereceptors").length;
  const satelliteUpgrades = techTypes.filter((t) => t === "satellitecount").length;
  const roverWaypointUpgrades = techTypes.filter((t) => t === "roverwaypoints").length;

  const researchPenalty = techTypes.reduce((total, tech) => {
    return total + (QUANTITY_UPGRADES.includes(tech) ? 10 : 2);
  }, 0);

  const surveyBonus = surveyRewards.reduce((sum, r) => sum + (r.stardust_granted ?? 0), 0);
  const availableStardust = Math.max(0, counts.all + surveyBonus - researchPenalty);

  return NextResponse.json({
    userId,
    researchedEntries: researchedRows,
    researchedTechTypes: techTypes,
    referralCode,
    referralCount,
    referralBonus,
    surveyBonus,
    counts,
    availableStardust,
    upgrades: {
      telescopeReceptors: 1 + telescopeUpgrades,
      satelliteCount: 1 + satelliteUpgrades,
      roverWaypoints: 4 + roverWaypointUpgrades * 2,
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
      unlockedSkills: Array.from(
        new Set(
          techTypes
            .map((tech) => {
              switch (tech) {
                case "planet-hunters":
                case "asteroid-hunting":
                case "planet-exploration":
                case "cloudspotting":
                case "active-asteroids":
                  return tech;
                default:
                  return null;
              }
            })
            .filter(Boolean)
        )
      ),
    },
  });
}
