import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type RoverDeployBody = {
  waypoints?: Array<{ x: number; y: number }>;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
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

  const [{ data: roverUpgradeRows, error: roverUpgradeError }, { data: findMineralsRows, error: mineralsError }] =
    await Promise.all([
      supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", user.id)
        .eq("tech_type", "roverwaypoints"),
      supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", user.id)
        .eq("tech_type", "findMinerals"),
    ]);

  if (roverUpgradeError || mineralsError) {
    return NextResponse.json(
      { error: roverUpgradeError?.message || mineralsError?.message || "Failed to load rover upgrades" },
      { status: 500 }
    );
  }

  const maxWaypoints = (roverUpgradeRows || []).length > 0 ? 6 : 4;
  if (waypoints.length > maxWaypoints) {
    return NextResponse.json({ error: `Too many waypoints for rover level (max ${maxWaypoints})` }, { status: 400 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentDeployments, error: recentError } = await supabase
    .from("linked_anomalies")
    .select("id")
    .eq("author", user.id)
    .eq("automaton", "Rover")
    .gte("date", sevenDaysAgo)
    .limit(1);

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  if ((recentDeployments || []).length > 0) {
    return NextResponse.json({ error: "Rover deployment has already occurred this week" }, { status: 409 });
  }

  const [classifiedRes, anomalyRes, classificationCountRes] = await Promise.all([
    supabase
      .from("classifications")
      .select("anomaly")
      .eq("classificationtype", "automaton-aiForMars")
      .eq("author", user.id),
    supabase.from("anomalies").select("id").eq("anomalySet", "automaton-aiForMars"),
    supabase.from("classifications").select("id", { count: "exact", head: true }).eq("author", user.id),
  ]);

  if (classifiedRes.error || anomalyRes.error || classificationCountRes.error) {
    return NextResponse.json(
      {
        error:
          classifiedRes.error?.message ||
          anomalyRes.error?.message ||
          classificationCountRes.error?.message ||
          "Failed to prepare rover deployment",
      },
      { status: 500 }
    );
  }

  const classifiedIds = new Set((classifiedRes.data || []).map((c) => c.anomaly));
  const allAnomalies = anomalyRes.data || [];
  let unclassified = allAnomalies.filter((a) => !classifiedIds.has(a.id));

  if (unclassified.length < waypoints.length) {
    unclassified = allAnomalies;
  }

  const selectedAnomalies = unclassified.slice(0, waypoints.length);
  if (selectedAnomalies.length === 0) {
    return NextResponse.json({ error: "No rover anomalies available" }, { status: 400 });
  }

  const isFastDeployEnabled = (classificationCountRes.count || 0) < 4;
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

  const { error: linkError } = await supabase.from("linked_anomalies").insert(linkedRows);
  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 500 });
  }

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

  const { error: routeError } = await supabase.from("routes").insert({
    author: user.id,
    routeConfiguration: routeConfig,
    location: selectedAnomalies[0]?.id || null,
    timestamp: routeTimestamp,
  });

  if (routeError) {
    return NextResponse.json({ error: routeError.message }, { status: 500 });
  }

  revalidatePath("/activity/deploy/roover");
  revalidatePath("/game");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true, inserted: linkedRows.length });
}
