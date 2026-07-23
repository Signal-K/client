import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow, mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const pb = await createPocketbaseAdminClient();

  const [latestPlanetResult, classificationCountResult, upgrades, existingDeployResult] = await Promise.all([
    pb.collection("classifications").getList(1, 1, {
      filter: pb.filter("classificationtype = {:t} && author = {:a}", { t: "planet", a: user.id }),
      sort: "-createdAt",
    }),
    pb.collection("classifications").getList(1, 1, { filter: pb.filter("author = {:a}", { a: user.id }) }),
    pb.collection("researched").getFullList({
      filter:
        pb.filter("userId = {:u}", { u: user.id }) +
        " && (" +
        ["roverwaypoints", "findMinerals"].map((t) => pb.filter("techType = {:t}", { t })).join(" || ") +
        ")",
    }),
    pb.collection("linked_anomalies").getList(1, 1, {
      filter: pb.filter("author = {:a} && automaton = {:auto}", { a: user.id, auto: "Rover" }),
    }),
  ]);

  const latestPlanetRecord = latestPlanetResult.items[0] ?? null;
  let latestPlanet: Record<string, any> | null = null;
  let planetAnomaly: Record<string, any> | null = null;

  if (latestPlanetRecord) {
    const mapped = mapClassificationToRow(latestPlanetRecord);
    if (mapped.anomaly != null) {
      const anomalyRecord = await pb
        .collection("anomalies")
        .getFirstListItem(pb.filter("legacyId = {:id}", { id: mapped.anomaly }))
        .catch(() => null);
      planetAnomaly = anomalyRecord ? mapAnomalyToRow(anomalyRecord) : null;
    }
    latestPlanet = { ...mapped, anomaly: planetAnomaly };
  }

  const hasRoverWaypoints = upgrades.some((u) => u.techType === "roverwaypoints");
  const hasFindMinerals = upgrades.some((u) => u.techType === "findMinerals");
  const classificationCount = classificationCountResult.totalItems;

  return NextResponse.json(recursiveSerialize({
    planetClassification: latestPlanet,
    planetAnomaly,
    userClassificationCount: classificationCount,
    isFastDeployEnabled: classificationCount < 4,
    roverUpgrades: {
      roverwaypoints: hasRoverWaypoints,
      findMinerals: hasFindMinerals,
    },
    maxWaypoints: hasRoverWaypoints ? 6 : 4,
    hasExistingRoverDeployment: existingDeployResult.totalItems > 0,
  }));
}
