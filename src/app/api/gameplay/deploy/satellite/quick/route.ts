import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type Body = {
  planetClassificationId?: number | string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const planetClassificationId = Number(body?.planetClassificationId);

  if (!Number.isFinite(planetClassificationId)) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid planet classification id" }), { status: 400 });
  }

  const pb = await createPocketbaseAdminClient();
  const cloudAnomalies = await pb.collection("anomalies").getFullList({
    filter: pb.filter("anomalytype = {:t}", { t: "cloud" }),
    fields: "legacyId",
  });

  if (cloudAnomalies.length === 0) {
    return NextResponse.json(recursiveSerialize({ error: "No cloud anomalies available" }), { status: 500 });
  }

  const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
  const selectedAnomaly = cloudAnomalies[randomIndex];

  const latest = await pb.collection("linked_anomalies").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  let nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  // Preserves existing (likely unintentional but load-bearing) behavior of
  // inserting the same linked_anomaly twice per quick-deploy.
  await Promise.all(
    [1, 2].map(() =>
      pb.collection("linked_anomalies").create({
        legacyId: nextLegacyId++,
        author: user.id,
        anomalyId: selectedAnomaly.legacyId,
        classificationId: planetClassificationId,
        automaton: "WeatherSatellite",
        date: new Date().toISOString(),
      })
    )
  );

  revalidatePath("/activity/deploy");
  revalidatePath("/game");

  return NextResponse.json(recursiveSerialize({ success: true }));
}
