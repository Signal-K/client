import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type InvestigationMode = "weather" | "p-4" | "planets";

type SatelliteDeployBody = {
  investigationMode?: InvestigationMode;
  planetId?: number;
};

function sampleIds(input: any[], count: number) {
  return [...input]
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map((item) => item.legacyId);
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SatelliteDeployBody;
  const investigationMode = body?.investigationMode;
  const planetId = Number(body?.planetId);

  if (!["weather", "p-4", "planets"].includes(String(investigationMode))) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid investigation mode" }), { status: 400 });
  }

  if (!Number.isFinite(planetId)) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid planet ID" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();

  const [classificationCount, satelliteUpgrade, planet, planetClassification] = await Promise.all([
    pb.collection("classifications").getList(1, 1, { filter: pb.filter("author = {:a}", { a: user.id }) }),
    pb
      .collection("researched")
      .getFirstListItem(pb.filter("userId = {:u} && techType = {:t}", { u: user.id, t: "satellitecount" }))
      .catch(() => null),
    pb
      .collection("anomalies")
      .getFirstListItem(pb.filter("legacyId = {:id}", { id: planetId }))
      .catch(() => null),
    pb
      .collection("classifications")
      .getFirstListItem(
        pb.filter("author = {:a} && anomaly = {:p} && classificationtype = {:t}", {
          a: user.id,
          p: planetId,
          t: "planet",
        })
      )
      .catch(() => null),
  ]);

  if (!planet) {
    return NextResponse.json(recursiveSerialize({ error: "Planet not found" }), { status: 404 });
  }

  const userClassificationCount = classificationCount.totalItems;
  const isFastDeployEnabled = userClassificationCount === 0;
  const deploymentDate = isFastDeployEnabled
    ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();
  const anomalyCount = satelliteUpgrade ? 6 : 4;
  const classificationId = planetClassification?.legacyId ?? null;

  let selectedIds: number[] = [];

  if (investigationMode === "planets") {
    selectedIds = [planetId];
  } else if (investigationMode === "weather") {
    const cloudCount = await pb.collection("classifications").getList(1, 1, {
      filter:
        pb.filter("author = {:a}", { a: user.id }) +
        " && (" +
        ["cloud", "vortex", "radar"].map((t) => pb.filter("classificationtype = {:t}", { t })).join(" || ") +
        ")",
    });
    const userCloudClassifications = cloudCount.totalItems;

    const anomalySets =
      userCloudClassifications >= 2
        ? ["lidar-jovianVortexHunter", "cloudspottingOnMars", "balloon-marsCloudShapes"]
        : ["cloudspottingOnMars"];

    const cloudRows = await pb.collection("anomalies").getFullList({
      filter: "(" + anomalySets.map((s) => pb.filter("anomalySet = {:s}", { s })).join(" || ") + ")",
      fields: "legacyId",
    });

    selectedIds = sampleIds(cloudRows, anomalyCount);
  } else {
    const p4Rows = await pb.collection("anomalies").getFullList({
      filter: pb.filter("anomalySet = {:s}", { s: "satellite-planetFour" }),
      fields: "legacyId",
    });

    selectedIds = sampleIds(p4Rows, anomalyCount);
  }

  if (selectedIds.length === 0) {
    return NextResponse.json(recursiveSerialize({ error: "No anomalies available for this deployment" }), { status: 400 });
  }

  const latest = await pb.collection("linked_anomalies").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  let nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await Promise.all(
    selectedIds.map((id) =>
      pb.collection("linked_anomalies").create({
        legacyId: nextLegacyId++,
        author: user.id,
        anomalyId: id,
        classificationId,
        date: deploymentDate,
        automaton: "WeatherSatellite",
        unlocked: false,
        unlockTime: null,
      })
    )
  );

  revalidatePath("/viewports/satellite/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/game");

  return NextResponse.json(recursiveSerialize({
    success: true,
    anomalyIds: selectedIds,
    sectorName: planet.content || `TIC ${planet.legacyId}`,
  }));
}
