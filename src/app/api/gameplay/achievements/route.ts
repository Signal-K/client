import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getRouteUser } from "@/lib/server/supabaseRoute";
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
  "galaxyZoo",
]);

function createEmptyAchievements() {
  return {
    classifications: [],
    mineralDeposits: {
      type: "mineral-deposit" as const,
      count: 0,
      milestones: MILESTONE_TIERS.map((tier) => ({
        tier,
        isUnlocked: false,
      })),
    },
    planetCompletions: {
      type: "planet-completion" as const,
      count: 0,
      milestones: MILESTONE_TIERS.map((tier) => ({
        tier,
        isUnlocked: false,
      })),
    },
    totalUnlocked: 0,
    totalAchievements: MILESTONE_TIERS.length * 2,
    authenticated: false,
  };
}

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(createEmptyAchievements());
  }

  const userId = user.id;
  const pb = await createPocketbaseAdminClient();

  const [classifications, mineralCountResult] = await Promise.all([
    pb.collection("classifications").getFullList({
      filter: pb.filter("author = {:author}", { author: userId }),
      fields: "legacyId,anomaly,classificationtype",
    }),
    pb.collection("mineral_deposits").getList(1, 1, {
      filter: pb.filter("owner = {:owner}", { owner: userId }),
      fields: "id",
    }),
  ]);

  const rows = classifications;
  const mineralCount = mineralCountResult.totalItems;
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
    const anomalyFilter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
    const classificationFilter = anomalyIds.map((id) => pb.filter("anomaly = {:id}", { id })).join(" || ");
    const depositFilter = anomalyIds.map((id) => pb.filter("anomaly = {:id}", { id })).join(" || ");

    const [anomalyRows, cloudRows, depositRows] = await Promise.all([
      pb.collection("anomalies").getFullList({
        filter: anomalyFilter,
        fields: "legacyId,density,temperature",
      }),
      pb.collection("classifications").getFullList({
        filter: `classificationtype = "cloud" && (${classificationFilter})`,
        fields: "anomaly",
      }),
      pb.collection("mineral_deposits").getFullList({
        filter: depositFilter,
        fields: "anomaly,mineralConfiguration",
      }),
    ]);

    const cloudAnomalySet = new Set<number>(
      cloudRows
        .map((row) => row.anomaly)
        .filter((id): id is number => typeof id === "number")
    );

    const depositsByAnomaly = new Map<number, any[]>();
    for (const deposit of depositRows) {
      if (typeof deposit.anomaly !== "number") continue;
      const list = depositsByAnomaly.get(deposit.anomaly) || [];
      list.push(deposit);
      depositsByAnomaly.set(deposit.anomaly, list);
    }

    for (const anomaly of anomalyRows) {
      const anomalyId = anomaly.legacyId;
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
          const config = deposit.mineralConfiguration;
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
    authenticated: true,
  });
}
