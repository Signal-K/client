import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [latestPlanetRes, classificationCountRes, upgradesRes, existingDeployRes] = await Promise.all([
    supabase
      .from("classifications")
      .select("*, anomaly:anomalies(*)")
      .eq("classificationtype", "planet")
      .eq("author", user.id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("classifications").select("id", { count: "exact", head: true }).eq("author", user.id),
    supabase
      .from("researched")
      .select("tech_type")
      .eq("user_id", user.id)
      .in("tech_type", ["roverwaypoints", "findMinerals"]),
    supabase
      .from("linked_anomalies")
      .select("id", { count: "exact", head: true })
      .eq("author", user.id)
      .eq("automaton", "Rover"),
  ]);

  if (latestPlanetRes.error || classificationCountRes.error || upgradesRes.error || existingDeployRes.error) {
    return NextResponse.json(
      {
        error:
          latestPlanetRes.error?.message ||
          classificationCountRes.error?.message ||
          upgradesRes.error?.message ||
          existingDeployRes.error?.message ||
          "Failed to load rover setup",
      },
      { status: 500 }
    );
  }

  const latestPlanet = (latestPlanetRes.data || [])[0] || null;
  const upgrades = upgradesRes.data || [];
  const hasRoverWaypoints = upgrades.some((u: any) => u.tech_type === "roverwaypoints");
  const hasFindMinerals = upgrades.some((u: any) => u.tech_type === "findMinerals");
  const classificationCount = classificationCountRes.count || 0;

  return NextResponse.json({
    planetClassification: latestPlanet,
    planetAnomaly: latestPlanet?.anomaly || null,
    userClassificationCount: classificationCount,
    isFastDeployEnabled: classificationCount < 4,
    roverUpgrades: {
      roverwaypoints: hasRoverWaypoints,
      findMinerals: hasFindMinerals,
    },
    maxWaypoints: hasRoverWaypoints ? 6 : 4,
    hasExistingRoverDeployment: (existingDeployRes.count || 0) > 0,
  });
}
