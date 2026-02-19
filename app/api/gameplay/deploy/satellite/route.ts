import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type InvestigationMode = "weather" | "p-4" | "planets";

type SatelliteDeployBody = {
  investigationMode?: InvestigationMode;
  planetId?: number;
};

function sampleIds(input: Array<{ id: number }>, count: number) {
  return [...input]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map((item) => item.id);
}

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SatelliteDeployBody;
  const investigationMode = body?.investigationMode;
  const planetId = Number(body?.planetId);

  if (!["weather", "p-4", "planets"].includes(String(investigationMode))) {
    return NextResponse.json({ error: "Invalid investigation mode" }, { status: 400 });
  }

  if (!Number.isFinite(planetId)) {
    return NextResponse.json({ error: "Invalid planet ID" }, { status: 400 });
  }

  const [
    { count: userClassificationCount, error: countError },
    { data: satelliteUpgradeRows, error: satUpgradeError },
    { data: planetRows, error: planetError },
    { data: planetClassifications, error: classificationError },
  ] = await Promise.all([
    supabase.from("classifications").select("id", { count: "exact", head: true }).eq("author", user.id),
    supabase.from("researched").select("tech_type").eq("user_id", user.id).eq("tech_type", "satellitecount"),
    supabase.from("anomalies").select("id, content").eq("id", planetId).limit(1),
    supabase
      .from("classifications")
      .select("id")
      .eq("author", user.id)
      .eq("anomaly", planetId)
      .eq("classificationtype", "planet")
      .limit(1),
  ]);

  if (countError || satUpgradeError || planetError || classificationError) {
    return NextResponse.json(
      {
        error:
          countError?.message ||
          satUpgradeError?.message ||
          planetError?.message ||
          classificationError?.message ||
          "Failed to prepare satellite deployment",
      },
      { status: 500 }
    );
  }

  const planet = (planetRows || [])[0];
  if (!planet) {
    return NextResponse.json({ error: "Planet not found" }, { status: 404 });
  }

  const isFastDeployEnabled = (userClassificationCount || 0) === 0;
  const deploymentDate = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();
  const anomalyCount = (satelliteUpgradeRows || []).length > 0 ? 6 : 4;
  const classificationId = (planetClassifications || [])[0]?.id || null;

  let selectedIds: number[] = [];

  if (investigationMode === "planets") {
    selectedIds = [planetId];
  } else if (investigationMode === "weather") {
    const { count: userCloudClassifications, error: cloudCountError } = await supabase
      .from("classifications")
      .select("id", { count: "exact", head: true })
      .eq("author", user.id)
      .in("classificationtype", ["cloud", "vortex", "radar"]);

    if (cloudCountError) {
      return NextResponse.json({ error: cloudCountError.message }, { status: 500 });
    }

    const anomalySets =
      (userCloudClassifications || 0) >= 2
        ? ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"]
        : ["cloudspottingOnMars"];

    const { data: cloudRows, error: cloudError } = await supabase
      .from("anomalies")
      .select("id")
      .in("anomalySet", anomalySets);

    if (cloudError) {
      return NextResponse.json({ error: cloudError.message }, { status: 500 });
    }

    selectedIds = sampleIds(cloudRows || [], anomalyCount);
  } else {
    const { data: p4Rows, error: p4Error } = await supabase
      .from("anomalies")
      .select("id")
      .eq("anomalySet", "satellite-planetFour");

    if (p4Error) {
      return NextResponse.json({ error: p4Error.message }, { status: 500 });
    }

    selectedIds = sampleIds(p4Rows || [], anomalyCount);
  }

  if (selectedIds.length === 0) {
    return NextResponse.json({ error: "No anomalies available for this deployment" }, { status: 400 });
  }

  const rows = selectedIds.map((id) => ({
    author: user.id,
    anomaly_id: id,
    classification_id: classificationId,
    date: deploymentDate,
    automaton: "WeatherSatellite",
    unlocked: false,
    unlock_time: null,
  }));

  const { error: insertError } = await supabase.from("linked_anomalies").insert(rows);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath("/viewports/satellite/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/game");

  return NextResponse.json({
    success: true,
    anomalyIds: selectedIds,
    sectorName: planet.content || `TIC ${planet.id}`,
  });
}
