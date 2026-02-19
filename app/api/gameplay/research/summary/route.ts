import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

const QUANTITY_UPGRADES = ["probereceptors", "satellitecount", "roverwaypoints"];

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [{ data: researched, error: researchedError }, { data: classifications, error: classificationsError }] =
    await Promise.all([
      supabase.from("researched").select("tech_type, created_at").eq("user_id", userId),
      supabase.from("classifications").select("classificationtype").eq("author", userId),
    ]);

  if (researchedError || classificationsError) {
    return NextResponse.json(
      {
        error: researchedError?.message || classificationsError?.message || "Failed to fetch research summary",
      },
      { status: 500 }
    );
  }

  const researchedRows = researched || [];
  const classificationRows = classifications || [];

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

  const availableStardust = Math.max(0, counts.all - researchPenalty);

  return NextResponse.json({
    userId,
    researchedEntries: researchedRows,
    researchedTechTypes: techTypes,
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
