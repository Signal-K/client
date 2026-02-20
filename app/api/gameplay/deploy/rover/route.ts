import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type RoverDeployBody = {
  waypoints?: Array<{ x: number; y: number }>;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as RoverDeployBody;
  const waypoints = Array.isArray(body?.waypoints)
    ? body.waypoints
        .map((w) => ({ x: Number(w.x), y: Number(w.y) }))
        .filter((w) => Number.isFinite(w.x) && Number.isFinite(w.y))
    : [];

  if (waypoints.length === 0) {
    return NextResponse.json({ error: "At least one waypoint is required" }, { status: 400 });
  }

  const upgradeRows = await prisma.$queryRaw<Array<{ tech_type: string }>>`
    SELECT tech_type
    FROM researched
    WHERE user_id = ${user.id}
      AND tech_type IN ('roverwaypoints', 'findMinerals')
  `;
  const roverUpgradeRows = upgradeRows.filter((r) => r.tech_type === "roverwaypoints");
  const findMineralsRows = upgradeRows.filter((r) => r.tech_type === "findMinerals");

  const maxWaypoints = (roverUpgradeRows || []).length > 0 ? 6 : 4;
  if (waypoints.length > maxWaypoints) {
    return NextResponse.json({ error: `Too many waypoints for rover level (max ${maxWaypoints})` }, { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentDeployments = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM linked_anomalies
    WHERE author = ${user.id}
      AND automaton = 'Rover'
      AND date >= ${sevenDaysAgo}
    LIMIT 1
  `;

  if ((recentDeployments || []).length > 0) {
    return NextResponse.json({ error: "Rover deployment has already occurred this week" }, { status: 409 });
  }

  const [classifiedRes, anomalyRes, classificationCountRows] = await Promise.all([
    prisma.$queryRaw<Array<{ anomaly: number }>>`
      SELECT anomaly
      FROM classifications
      WHERE classificationtype = 'automaton-aiForMars'
        AND author = ${user.id}
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM anomalies
      WHERE "anomalySet" = 'automaton-aiForMars'
    `,
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM classifications
      WHERE author = ${user.id}
    `,
  ]);

  const classifiedIds = new Set(classifiedRes.map((c) => c.anomaly));
  const allAnomalies = anomalyRes;
  let unclassified = allAnomalies.filter((a) => !classifiedIds.has(a.id));

  if (unclassified.length < waypoints.length) {
    unclassified = allAnomalies;
  }

  const selectedAnomalies = unclassified.slice(0, waypoints.length);
  if (selectedAnomalies.length === 0) {
    return NextResponse.json({ error: "No rover anomalies available" }, { status: 400 });
  }

  const isFastDeployEnabled = Number(classificationCountRows[0]?.count ?? 0) < 4;
  const deploymentDate = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  const linkedRows = selectedAnomalies.map((anomaly) => ({
    author: user.id,
    anomaly_id: anomaly.id,
    automaton: "Rover",
    date: deploymentDate,
    unlocked: true,
  }));

  await prisma.$executeRaw`
    INSERT INTO linked_anomalies (author, anomaly_id, automaton, date, unlocked)
    SELECT x.author, x.anomaly_id, x.automaton, x.date::timestamptz, x.unlocked
    FROM jsonb_to_recordset(${JSON.stringify(linkedRows)}::jsonb)
      AS x(author text, anomaly_id int, automaton text, date text, unlocked boolean)
  `;

  const hasFindMinerals = (findMineralsRows || []).length > 0;
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
    anomalyId: selectedAnomalies[index]?.id || null,
  }));

  const routeConfig = {
    anomalies: selectedAnomalies.map((a) => a.id),
    waypoints: waypointsWithMinerals,
    mineralWaypoints: mineralWaypointIndices,
  };

  const routeTimestamp = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  await prisma.$executeRaw`
    INSERT INTO routes (author, "routeConfiguration", location, timestamp)
    VALUES (
      ${user.id},
      ${JSON.stringify(routeConfig)}::jsonb,
      ${selectedAnomalies[0]?.id || null},
      ${routeTimestamp}
    )
  `;

  revalidatePath("/activity/deploy/roover");
  revalidatePath("/game");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true, inserted: linkedRows.length });
}
