import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";
import { MILESTONE_TIERS } from "@/src/types/achievement";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set([
  "DiskDetective",
  "automaton-aiForMars",
  "balloon-marsCloudShapes",
  "cloud",
  "lidar-jovianVortexHunter",
  "planet",
  "planet-inspection",
  "sunspot",
  "satellite-planetFour",
]);

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [{ data: classifications, error: classificationsError }, { count: mineralCount, error: mineralCountError }] =
    await Promise.all([
      supabase
        .from("classifications")
        .select("id, anomaly, classificationtype")
        .eq("author", userId),
      supabase
        .from("mineral_deposits")
        .select("id", { count: "exact", head: true })
        .eq("owner", userId),
    ]);

  if (classificationsError || mineralCountError) {
    return NextResponse.json(
      {
        error: classificationsError?.message || mineralCountError?.message || "Failed to load achievements",
      },
      { status: 500 }
    );
  }

  const rows = classifications || [];
  const classificationCounts: Record<string, number> = {};
  const planetAnomalyIds = new Set<number>();

  for (const row of rows) {
    const type = row.classificationtype;
    if (VALID_TYPES.has(type)) {
      classificationCounts[type] = (classificationCounts[type] || 0) + 1;
    }
    if (type === "planet" && typeof row.anomaly === "number") {
      planetAnomalyIds.add(row.anomaly);
    }
  }

  const classificationAchievements = Object.entries(classificationCounts).map(([type, count]) => ({
    type: "classification" as const,
    classificationType: type,
    count,
    milestones: MILESTONE_TIERS.map((tier) => ({
      tier,
      isUnlocked: count >= tier,
    })),
  }));

  const mineralDeposits = {
    type: "mineral-deposit" as const,
    count: mineralCount || 0,
    milestones: MILESTONE_TIERS.map((tier) => ({
      tier,
      isUnlocked: (mineralCount || 0) >= tier,
    })),
  };

  let completedPlanetsCount = 0;
  const anomalyIds = Array.from(planetAnomalyIds);

  if (anomalyIds.length > 0) {
    const [
      { data: anomalyRows, error: anomalyError },
      { data: cloudRows, error: cloudError },
      { data: depositRows, error: depositsError },
    ] = await Promise.all([
      supabase
        .from("anomalies")
        .select("id, density, temperature")
        .in("id", anomalyIds),
      supabase
        .from("classifications")
        .select("anomaly")
        .eq("classificationtype", "cloud")
        .in("anomaly", anomalyIds),
      supabase
        .from("mineral_deposits")
        .select("anomaly, mineral_configuration")
        .in("anomaly", anomalyIds),
    ]);

    if (anomalyError || cloudError || depositsError) {
      return NextResponse.json(
        {
          error: anomalyError?.message || cloudError?.message || depositsError?.message || "Failed to compute planets",
        },
        { status: 500 }
      );
    }

    const cloudAnomalySet = new Set<number>(
      (cloudRows || [])
        .map((row) => row.anomaly)
        .filter((id): id is number => typeof id === "number")
    );

    const depositsByAnomaly = new Map<number, any[]>();
    for (const deposit of depositRows || []) {
      if (typeof deposit.anomaly !== "number") continue;
      const list = depositsByAnomaly.get(deposit.anomaly) || [];
      list.push(deposit);
      depositsByAnomaly.set(deposit.anomaly, list);
    }

    for (const anomaly of anomalyRows || []) {
      const anomalyId = anomaly.id;
      const density = anomaly.density;
      const temperature = anomaly.temperature;

      let planetType: "Terrestrial" | "Gaseous" | "Habitable" | "Unsurveyed" = "Unsurveyed";
      let requiresWater = false;

      if (density !== null && density !== undefined) {
        if (density < 2.5) {
          planetType = "Gaseous";
        } else if (temperature !== null && temperature !== undefined && temperature >= -15 && temperature <= 50) {
          planetType = "Habitable";
          requiresWater = true;
        } else {
          planetType = "Terrestrial";
        }
      }

      const deposits = depositsByAnomaly.get(anomalyId) || [];
      const hasClouds = cloudAnomalySet.has(anomalyId);
      const hasDeposits = deposits.length > 0;

      let hasWater = false;
      if (requiresWater) {
        hasWater = deposits.some((deposit) => {
          const config = deposit.mineral_configuration;
          const type = config?.type?.toLowerCase?.() || "";
          return type.includes("water") || type.includes("ice") || type.includes("h2o");
        });
      }

      const hasCloudsOrDeposits = hasClouds || hasDeposits;
      const hasDensity = planetType !== "Unsurveyed";
      const waterRequirementMet = !requiresWater || hasWater;

      if (hasCloudsOrDeposits && hasDensity && waterRequirementMet) {
        completedPlanetsCount += 1;
      }
    }
  }

  const planetCompletions = {
    type: "planet-completion" as const,
    count: completedPlanetsCount,
    milestones: MILESTONE_TIERS.map((tier) => ({
      tier,
      isUnlocked: completedPlanetsCount >= tier,
    })),
  };

  const totalUnlocked =
    classificationAchievements.reduce((sum, item) => {
      return sum + item.milestones.filter((m) => m.isUnlocked).length;
    }, 0) +
    mineralDeposits.milestones.filter((m) => m.isUnlocked).length +
    planetCompletions.milestones.filter((m) => m.isUnlocked).length;

  const totalAchievements = classificationAchievements.length * MILESTONE_TIERS.length + MILESTONE_TIERS.length * 2;

  return NextResponse.json({
    classifications: classificationAchievements,
    mineralDeposits,
    planetCompletions,
    totalUnlocked,
    totalAchievements,
  });
}

