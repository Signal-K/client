import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow, mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type CreateClassificationPayload = {
  anomaly?: number | string | null;
  classificationtype?: string;
  content?: string | null;
  media?: any;
  classificationConfiguration?: any;
};

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idParam = request.nextUrl.searchParams.get("id");
  const idsParam = request.nextUrl.searchParams.get("ids");
  const author = request.nextUrl.searchParams.get("author");
  const classificationtype = request.nextUrl.searchParams.get("classificationtype");
  const anomalyParam = request.nextUrl.searchParams.get("anomaly");
  const anomaliesParam = request.nextUrl.searchParams.get("anomalies");
  const orderByParam = request.nextUrl.searchParams.get("orderBy");
  const ascending = request.nextUrl.searchParams.get("ascending") === "true";
  const includeAnomaly = request.nextUrl.searchParams.get("includeAnomaly") === "true";
  const limit = Number(request.nextUrl.searchParams.get("limit") || 200);

  const pb = await createPocketbaseAdminClient();
  const filters: string[] = [];

  if (idParam) {
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    filters.push(pb.filter("legacyId = {:id}", { id }));
  }

  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (ids.length > 0) {
      filters.push("(" + ids.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ") + ")");
    }
  }

  if (author) {
    filters.push(pb.filter("author = {:author}", { author }));
  }

  if (classificationtype) {
    filters.push(pb.filter("classificationtype = {:t}", { t: classificationtype }));
  }

  if (anomalyParam) {
    const anomaly = Number(anomalyParam);
    if (!Number.isFinite(anomaly)) {
      return NextResponse.json({ error: "Invalid anomaly" }, { status: 400 });
    }
    filters.push(pb.filter("anomaly = {:a}", { a: anomaly }));
  }

  if (anomaliesParam) {
    const anomalies = anomaliesParam
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (anomalies.length > 0) {
      filters.push("(" + anomalies.map((a) => pb.filter("anomaly = {:a}", { a })).join(" || ") + ")");
    }
  }

  const sortField = orderByParam === "id" ? "legacyId" : "createdAt";
  const sort = `${ascending ? "+" : "-"}${sortField}`;
  const validatedLimit = Math.max(1, Math.min(limit, 2000));

  const result = await pb.collection("classifications").getList(1, validatedLimit, {
    filter: filters.join(" && "),
    sort,
  });

  const rows = result.items.map(mapClassificationToRow);

  if (includeAnomaly) {
    const anomalyIds = [...new Set(rows.map((r) => r.anomaly).filter((a): a is number => a != null))];
    let anomalyByLegacyId = new Map<number, Record<string, any>>();
    if (anomalyIds.length > 0) {
      const anomalyFilter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
      const anomalyRecords = await pb.collection("anomalies").getFullList({ filter: anomalyFilter });
      anomalyByLegacyId = new Map(anomalyRecords.map((a) => [a.legacyId, mapAnomalyToRow(a)]));
    }
    const withAnomaly = rows.map((r) => ({ ...r, anomaly: anomalyByLegacyId.get(r.anomaly!) ?? null }));
    return NextResponse.json({ classifications: recursiveSerialize(withAnomaly) });
  }

  return NextResponse.json({ classifications: recursiveSerialize(rows) });
}

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateClassificationPayload;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const classificationtype =
    typeof body?.classificationtype === "string" ? body.classificationtype.trim() : "";

  if (!Number.isFinite(anomaly) || !classificationtype) {
    return NextResponse.json(
      { error: "Invalid payload: anomaly and classificationtype are required" },
      { status: 400 }
    );
  }

  try {
    const pb = await createPocketbaseAdminClient();

    // legacyId assignment mirrors the old autoincrement PK: one past the
    // current max. Not safe under high concurrency, but matches this app's
    // existing single-writer-per-request pattern.
    const latest = await pb
      .collection("classifications")
      .getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
    const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

    const created = await pb.collection("classifications").create({
      legacyId: nextLegacyId,
      createdAt: new Date().toISOString(),
      author: user.id,
      anomaly,
      classificationtype,
      content: typeof body?.content === "string" ? body.content : "",
      media: body?.media ?? null,
      classificationConfiguration: body?.classificationConfiguration ?? null,
    });

    revalidatePath("/game");
    revalidatePath("/research");
    revalidatePath("/viewports/satellite");
    revalidatePath("/viewports/solar");
    revalidatePath("/viewports/rover");
    revalidatePath(`/next/${nextLegacyId}`);

    return NextResponse.json(recursiveSerialize(mapClassificationToRow(created)));
  } catch (error: any) {
    console.error("Error creating classification:", error);
    return NextResponse.json(
      { error: "Failed to create classification", details: error.message },
      { status: 500 }
    );
  }
}
