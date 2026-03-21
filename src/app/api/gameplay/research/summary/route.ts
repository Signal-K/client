import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getResearchedProgressForUser, getSurveyBonusForUser, QUANTITY_UPGRADES } from "@/lib/server/researched";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

function createEmptySummary() {
  return {
    authenticated: false,
    userId: null,
    researchedEntries: [],
    researchedTechTypes: [],
    referralCode: null,
    referralCount: 0,
    referralBonus: 0,
    surveyBonus: 0,
    counts: {
      all: 0,
      asteroid: 0,
      cloud: 0,
      planet: 0,
    },
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
    skillTree: {
      classifiedPlanets: 0,
      discoveredAsteroids: 0,
      unlockedSkills: [],
    },
  };
}

export async function GET() {
  try {
    const { user, authError } = await getRouteUser();

    if (authError || !user) {
      return NextResponse.json(createEmptySummary());
    }

    const userId = user.id;

    const [researchProgress, classifications, surveyBonus, profile] = await Promise.all([
      getResearchedProgressForUser(userId),
      prisma.classification.findMany({
        where: { author: userId },
        select: { classificationtype: true },
      }),
      getSurveyBonusForUser(userId),
      prisma.profile.findUnique({
        where: { id: userId },
        select: { referralCode: true },
      }),
    ]);

    const referralCode = profile?.referralCode ?? null;
    let referralCount = 0;
    if (referralCode) {
      referralCount = await prisma.referral.count({
        where: { referralCode },
      });
    }
    const referralBonus = referralCount * 5;

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

    const techTypes = researchProgress.techTypes;
    const techSet = new Set(techTypes);

    const telescopeUpgrades = techTypes.filter((t) => t === "probereceptors").length;
    const satelliteUpgrades = techTypes.filter((t) => t === "satellitecount").length;
    const roverWaypointUpgrades = techTypes.filter((t) => t === "roverwaypoints").length;

    const researchPenalty = techTypes.reduce(
      (total, tech) => total + (QUANTITY_UPGRADES.includes(tech as (typeof QUANTITY_UPGRADES)[number]) ? 10 : 2),
      0
    );
    const availableStardust = Math.max(0, counts.all + surveyBonus - researchPenalty);

    return NextResponse.json({
      authenticated: true,
      userId,
      researchedEntries: researchProgress.entries,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[research-summary] GET error:", message);
    return NextResponse.json({ error: "Internal server error", message }, { status: 500 });
  }
}
