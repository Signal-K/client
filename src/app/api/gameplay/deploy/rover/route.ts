import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type RoverDeployBody = {
  waypoints?: Array<{ x: number; y: number }>;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as RoverDeployBody;
  const waypoints = Array.isArray(body?.waypoints)
    ? body.waypoints
        .map((w) => ({ x: Number(w.x), y: Number(w.y) }))
        .filter((w) => Number.isFinite(w.x) && Number.isFinite(w.y))
    : [];

  if (waypoints.length === 0) {
    return NextResponse.json(recursiveSerialize({ error: "At least one waypoint is required" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();

  const upgradeRows = await pb.collection("researched").getFullList({
    filter:
      pb.filter("userId = {:u}", { u: user.id }) +
      " && (" +
      ["roverwaypoints", "findMinerals"].map((t) => pb.filter("techType = {:t}", { t })).join(" || ") +
      ")",
  });
  const roverUpgradeRows = upgradeRows.filter((r) => r.techType === "roverwaypoints");
  const findMineralsRows = upgradeRows.filter((r) => r.techType === "findMinerals");

  const maxWaypoints = roverUpgradeRows.length > 0 ? 6 : 4;
  if (waypoints.length > maxWaypoints) {
    return NextResponse.json(recursiveSerialize({ error: `Too many waypoints for rover level (max ${maxWaypoints})` }), { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentDeployments = await pb.collection("linked_anomalies").getList(1, 1, {
    filter: pb.filter("author = {:a} && automaton = {:auto} && date >= {:d}", {
      a: user.id,
      auto: "Rover",
      d: sevenDaysAgo,
    }),
  });

  if (recentDeployments.totalItems > 0) {
    return NextResponse.json(recursiveSerialize({ error: "Rover deployment has already occurred this week" }), { status: 409 });
  }

  const [classifiedRes, allAnomalies, classificationCountResult] = await Promise.all([
    pb.collection("ss_classifications").getFullList({
      filter: pb.filter("classificationtype = {:t} && author = {:a}", { t: "automaton-aiForMars", a: user.id }),
      fields: "anomaly",
    }),
    pb.collection("anomalies").getFullList({
      filter: pb.filter("anomalySet = {:s}", { s: "automaton-aiForMars" }),
      fields: "legacyId",
    }),
    pb.collection("ss_classifications").getList(1, 1, { filter: pb.filter("author = {:a}", { a: user.id }) }),
  ]);

  const classifiedIds = new Set(classifiedRes.map((c) => c.anomaly));
  let unclassified = allAnomalies.filter((a) => !classifiedIds.has(a.legacyId));

  if (unclassified.length < waypoints.length) {
    unclassified = allAnomalies;
  }

  const selectedAnomalies = unclassified.slice(0, waypoints.length);
  if (selectedAnomalies.length === 0) {
    return NextResponse.json(recursiveSerialize({ error: "No rover anomalies available" }), { status: 400 });
  }

  const isFastDeployEnabled = classificationCountResult.totalItems < 4;
  const deploymentDate = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  const latestLinked = await pb
    .collection("linked_anomalies")
    .getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  let nextLinkedLegacyId = (latestLinked.items[0]?.legacyId ?? 0) + 1;

  await Promise.all(
    selectedAnomalies.map((anomaly) =>
      pb.collection("linked_anomalies").create({
        legacyId: nextLinkedLegacyId++,
        author: user.id,
        anomalyId: anomaly.legacyId,
        automaton: "Rover",
        date: deploymentDate,
        unlocked: true,
      })
    )
  );

  const hasFindMinerals = findMineralsRows.length > 0;
  const mineralWaypointIndices: number[] = [];

  if (hasFindMinerals && waypoints.length > 0) {
    for (let i = 0; i < waypoints.length; i += 1) {
      if ((i + 1) % 4 === 0) {
        mineralWaypointIndices.push(i);
      }
    }
    if (mineralWaypointIndices.length === 0) {
      mineralWaypointIndices.push(waypoints.length - 1);
    }
  }

  const waypointsWithMinerals = waypoints.map((wp, index) => ({
    ...wp,
    hasMineralDeposit: mineralWaypointIndices.includes(index),
    anomalyId: selectedAnomalies[index]?.legacyId || null,
  }));

  const routeConfig = {
    anomalies: selectedAnomalies.map((a) => a.legacyId),
    waypoints: waypointsWithMinerals,
    mineralWaypoints: mineralWaypointIndices,
  };

  const routeTimestamp = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  const latestRoute = await pb.collection("routes").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextRouteLegacyId = (latestRoute.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("routes").create({
    legacyId: nextRouteLegacyId,
    author: user.id,
    routeConfiguration: routeConfig,
    location: selectedAnomalies[0]?.legacyId || null,
    timestamp: routeTimestamp,
  });

  revalidatePath("/activity/deploy/rover");
  revalidatePath("/game");
  revalidatePath("/viewports/rover");

  return NextResponse.json(recursiveSerialize({ success: true, inserted: selectedAnomalies.length }));
}
