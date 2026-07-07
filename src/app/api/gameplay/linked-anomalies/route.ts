import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapLinkedAnomalyToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

type DeleteBody = {
  anomalyId?: number | string;
  automaton?: string;
  linkedAnomalyId?: number | string;
};

type PatchBody = {
  id?: number | string;
  unlocked?: boolean;
};

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anomalyIdParam = request.nextUrl.searchParams.get("anomalyId");
  const classificationIdOnly = request.nextUrl.searchParams.get("classificationIdOnly") === "true";
  const automaton = request.nextUrl.searchParams.get("automaton");
  const dateGte = request.nextUrl.searchParams.get("dateGte");

  const pb = await createPocketbaseAdminClient();

  if (anomalyIdParam) {
    const anomalyId = Number(anomalyIdParam);
    if (!Number.isFinite(anomalyId)) {
      return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
    }

    const row = await pb
      .collection("linked_anomalies")
      .getFirstListItem(
        pb.filter("author = {:author} && anomalyId = {:aid}", { author: user.id, aid: anomalyId }),
        { sort: "-legacyId" }
      )
      .catch(() => null);

    if (classificationIdOnly) {
      return NextResponse.json(recursiveSerialize({ classification_id: row?.classificationId ?? null }));
    }
    return NextResponse.json(recursiveSerialize({ linkedAnomaly: row ? mapLinkedAnomalyToRow(row) : null }));
  }

  const filters = [pb.filter("author = {:author}", { author: user.id })];
  if (automaton) {
    filters.push(pb.filter("automaton = {:a}", { a: automaton }));
  }
  if (dateGte) {
    filters.push(pb.filter("date >= {:d}", { d: dateGte }));
  }

  const result = await pb.collection("linked_anomalies").getList(1, 500, {
    filter: filters.join(" && "),
    sort: "-legacyId",
  });
  return NextResponse.json(recursiveSerialize({ linkedAnomalies: result.items.map(mapLinkedAnomalyToRow) }));
}

export async function DELETE(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteBody;

  const pb = await createPocketbaseAdminClient();
  const filters = [pb.filter("author = {:author}", { author: user.id })];
  let hasExtraFilter = false;

  if (body?.linkedAnomalyId !== undefined && body?.linkedAnomalyId !== null) {
    const linkedAnomalyId = Number(body.linkedAnomalyId);
    if (!Number.isFinite(linkedAnomalyId)) {
      return NextResponse.json({ error: "Invalid linkedAnomalyId" }, { status: 400 });
    }
    filters.push(pb.filter("legacyId = {:id}", { id: linkedAnomalyId }));
    hasExtraFilter = true;
  }

  if (body?.anomalyId !== undefined && body?.anomalyId !== null) {
    const anomalyId = Number(body.anomalyId);
    if (!Number.isFinite(anomalyId)) {
      return NextResponse.json({ error: "Invalid anomalyId" }, { status: 400 });
    }
    filters.push(pb.filter("anomalyId = {:aid}", { aid: anomalyId }));
    hasExtraFilter = true;
  }

  if (typeof body?.automaton === "string" && body.automaton.trim()) {
    filters.push(pb.filter("automaton = {:a}", { a: body.automaton.trim() }));
    hasExtraFilter = true;
  }

  if (!hasExtraFilter) {
    return NextResponse.json({ error: "At least one delete filter is required" }, { status: 400 });
  }

  const toDelete = await pb.collection("linked_anomalies").getFullList({ filter: filters.join(" && ") });
  await Promise.all(toDelete.map((record) => pb.collection("linked_anomalies").delete(record.id)));

  revalidatePath("/activity/deploy");
  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/rover");

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as PatchBody;
  const id = Number(body?.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (typeof body?.unlocked === "boolean") {
    const pb = await createPocketbaseAdminClient();
    const record = await pb
      .collection("linked_anomalies")
      .getFirstListItem(pb.filter("legacyId = {:id} && author = {:author}", { id, author: user.id }))
      .catch(() => null);
    if (record) {
      await pb.collection("linked_anomalies").update(record.id, { unlocked: body.unlocked });
    }
  } else {
    return NextResponse.json({ error: "No valid patch fields provided" }, { status: 400 });
  }

  revalidatePath("/viewports/satellite");
  revalidatePath("/viewports/rover");

  return NextResponse.json({ success: true });
}
