import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type Body = {
  planetClassificationId?: number | string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const planetClassificationId = Number(body?.planetClassificationId);

  if (!Number.isFinite(planetClassificationId)) {
    return NextResponse.json({ error: "Invalid planet classification id" }, { status: 400 });
  }

  const cloudAnomalies = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM anomalies
    WHERE anomalytype = 'cloud'
  `;

  if (cloudAnomalies.length === 0) {
    return NextResponse.json({ error: "No cloud anomalies available" }, { status: 500 });
  }

  const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
  const selectedAnomaly = cloudAnomalies[randomIndex];

  const insertPayload = [
    {
      author: user.id,
      anomaly_id: selectedAnomaly.id,
      classification_id: planetClassificationId,
      automaton: "WeatherSatellite",
    },
    {
      author: user.id,
      anomaly_id: selectedAnomaly.id,
      classification_id: planetClassificationId,
      automaton: "WeatherSatellite",
    },
  ];

  await prisma.$executeRaw`
    INSERT INTO linked_anomalies (author, anomaly_id, classification_id, automaton)
    SELECT x.author, x.anomaly_id, x.classification_id, x.automaton
    FROM jsonb_to_recordset(${JSON.stringify(insertPayload)}::jsonb)
      AS x(author text, anomaly_id int, classification_id int, automaton text)
  `;

  revalidatePath("/activity/deploy");
  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
