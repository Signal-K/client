import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type AnomalyInput = Record<string, any>;

type AnomalyBody = {
  anomalies?: AnomalyInput[];
  anomaly?: AnomalyInput;
};

export async function GET(request: NextRequest) {
  const anomalySet = request.nextUrl.searchParams.get("anomalySet");
  const parentAnomaly = request.nextUrl.searchParams.get("parentAnomaly");
  const id = request.nextUrl.searchParams.get("id");
  const ids = request.nextUrl.searchParams.get("ids");
  const author = request.nextUrl.searchParams.get("author");
  const content = request.nextUrl.searchParams.get("content");
  const limit = Number(request.nextUrl.searchParams.get("limit") || 500);
  const clampedLimit = Math.max(1, Math.min(limit, 2000));

  const pb = await createPocketbaseAdminClient();
  const filters: string[] = [];

  if (anomalySet) {
    filters.push(pb.filter("anomalySet = {:v}", { v: anomalySet }));
  }
  if (parentAnomaly) {
    const value = Number(parentAnomaly);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Invalid parentAnomaly" }, { status: 400 });
    }
    filters.push(pb.filter("parentAnomaly = {:v}", { v: Math.trunc(value) }));
  }
  if (id) {
    const value = Number(id);
    if (!Number.isFinite(value)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    filters.push(pb.filter("legacyId = {:v}", { v: Math.trunc(value) }));
  }
  if (ids) {
    const parsed = ids
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x))
      .map((x) => Math.trunc(x));
    if (parsed.length > 0) {
      filters.push("(" + parsed.map((v) => pb.filter("legacyId = {:v}", { v })).join(" || ") + ")");
    }
  }
  if (author) {
    filters.push(pb.filter("author = {:v}", { v: author }));
  }
  if (content) {
    filters.push(pb.filter("content = {:v}", { v: content }));
  }

  try {
    const result = await pb.collection("anomalies").getList(1, clampedLimit, {
      filter: filters.join(" && "),
      sort: "-legacyId",
    });

    return NextResponse.json({ anomalies: recursiveSerialize(result.items.map(mapAnomalyToRow)) });
  } catch (err: unknown) {
    console.error("Error fetching anomalies:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as AnomalyBody;
  const rows = Array.isArray(body?.anomalies)
    ? body.anomalies
    : body?.anomaly
    ? [body.anomaly]
    : [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No anomalies provided" }, { status: 400 });
  }

  try {
    const pb = await createPocketbaseAdminClient();
    const latest = await pb.collection("anomalies").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
    let nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

    const created = [];
    for (const row of rows) {
      const legacyId = typeof row.id === "number" ? row.id : nextLegacyId++;
      const record = await pb.collection("anomalies").create({
        legacyId,
        content: row.content ?? null,
        ticId: row.ticId ?? null,
        anomalytype: row.anomalytype ?? null,
        type: row.type ?? null,
        radius: row.radius ?? null,
        mass: row.mass ?? null,
        density: row.density ?? null,
        gravity: row.gravity ?? null,
        temperatureEq: row.temperatureEq ?? null,
        temperature: row.temperature ?? null,
        smaxis: row.smaxis ?? null,
        orbitalPeriod: row.orbital_period ?? row.orbitalPeriod ?? null,
        classificationStatus: row.classification_status ?? row.classificationStatus ?? null,
        avatarUrl: row.avatar_url ?? row.avatarUrl ?? null,
        createdAt: new Date().toISOString(),
        deepnote: row.deepnote ?? null,
        lightkurve: row.lightkurve ?? null,
        configuration: row.configuration ?? null,
        parentAnomaly: row.parentAnomaly ?? null,
        anomalySet: row.anomalySet ?? null,
        anomalyConfiguration: row.anomalyConfiguration ?? null,
      });
      created.push({ id: record.legacyId, avatar_url: record.avatarUrl });
    }

    revalidatePath("/game");
    revalidatePath("/viewports/rover");

    return NextResponse.json(recursiveSerialize(created));
  } catch (err: unknown) {
    console.error("Error creating anomalies:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
