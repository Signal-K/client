import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [planetClassificationsRes, telescopeRes, satelliteRes, roverRes, userClassificationsRes] = await Promise.all([
    supabase
      .from("classifications")
      .select("anomaly, anomaly_data:anomaly(content)")
      .eq("author", user.id)
      .eq("classificationtype", "planet"),
    supabase
      .from("linked_anomalies")
      .select("anomaly_id")
      .eq("author", user.id)
      .eq("automaton", "Telescope")
      .gte("date", oneWeekAgo.toISOString()),
    supabase
      .from("linked_anomalies")
      .select("anomaly_id")
      .eq("author", user.id)
      .eq("automaton", "WeatherSatellite"),
    supabase
      .from("linked_anomalies")
      .select("anomaly_id")
      .eq("author", user.id)
      .eq("automaton", "Rover"),
    supabase.from("classifications").select("anomaly").eq("author", user.id),
  ]);

  if (
    planetClassificationsRes.error ||
    telescopeRes.error ||
    satelliteRes.error ||
    roverRes.error ||
    userClassificationsRes.error
  ) {
    return NextResponse.json(
      {
        error:
          planetClassificationsRes.error?.message ||
          telescopeRes.error?.message ||
          satelliteRes.error?.message ||
          roverRes.error?.message ||
          userClassificationsRes.error?.message ||
          "Failed to load deployment status",
      },
      { status: 500 }
    );
  }

  const planetTargets = (planetClassificationsRes.data || [])
    .map((c: any) => {
      const anomalyId = Number(c.anomaly);
      if (!Number.isFinite(anomalyId)) return null;
      return {
        id: anomalyId,
        name: c.anomaly_data?.content || `Planet #${anomalyId}`,
      };
    })
    .filter(Boolean);

  const classifiedAnomalyIds = new Set(
    (userClassificationsRes.data || []).map((c: any) => c.anomaly).filter(Boolean)
  );

  const telescopeDeployments = telescopeRes.data || [];
  const satelliteDeployments = satelliteRes.data || [];
  const roverDeployments = roverRes.data || [];

  const telescopeUnclassified = telescopeDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;
  const satelliteUnclassified = satelliteDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;
  const roverUnclassified = roverDeployments.filter(
    (deployment: any) => !classifiedAnomalyIds.has(deployment.anomaly_id)
  ).length;

  return NextResponse.json({
    deploymentStatus: {
      telescope: {
        deployed: telescopeDeployments.length > 0,
        unclassifiedCount: telescopeUnclassified,
      },
      satellites: {
        deployed: satelliteDeployments.length > 0,
        unclassifiedCount: satelliteUnclassified,
        available: planetTargets.length > 0,
      },
      rover: {
        deployed: roverDeployments.length > 0,
        unclassifiedCount: roverUnclassified,
      },
    },
    planetTargets,
  });
}
