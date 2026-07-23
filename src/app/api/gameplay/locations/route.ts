import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

function parseConfig(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const showAllUsers = request.nextUrl.searchParams.get("showAllUsers") === "true";

  const pb = await createPocketbaseAdminClient();
  const filters = [
    "(" +
      ["planet", "telescope-minorPlanet"].map((t) => pb.filter("classificationtype = {:t}", { t })).join(" || ") +
      ")",
  ];
  if (!showAllUsers) {
    filters.push(pb.filter("author = {:author}", { author: user.id }));
  }

  const result = await pb.collection("classifications").getList(1, 250, {
    filter: filters.join(" && "),
    sort: "-createdAt",
  });

  const anomalyIds = Array.from(
    new Set(result.items.map((row) => row.anomaly).filter((v): v is number => Number.isFinite(Number(v))))
  );

  let anomalyContentById = new Map<number, string | null>();
  if (anomalyIds.length > 0) {
    const anomalyFilter = anomalyIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
    const anomalyRecords = await pb.collection("anomalies").getFullList({
      filter: anomalyFilter,
      fields: "legacyId,content",
    });
    anomalyContentById = new Map(anomalyRecords.map((a) => [a.legacyId, a.content ?? null]));
  }

  // author's own classifications tagged with a parentPlanetLocation, grouped
  // by that location — filtered client-side since matching against a JSON
  // field's nested value isn't reliably filterable server-side here.
  const ownClassifications = await pb.collection("classifications").getFullList({
    filter: pb.filter("author = {:author}", { author: user.id }),
  });
  const relatedByParent = new Map<number, Array<Record<string, unknown>>>();
  for (const row of ownClassifications) {
    const config = parseConfig(row.classificationConfiguration);
    const parent = Number(config?.parentPlanetLocation);
    if (!Number.isFinite(parent)) continue;
    const existing = relatedByParent.get(parent) || [];
    existing.push(mapClassificationToRow(row));
    relatedByParent.set(parent, existing);
  }

  const payload = result.items.map((row) => {
    const mapped = mapClassificationToRow(row);
    return {
      ...mapped,
      anomalyContent: mapped.anomaly != null ? anomalyContentById.get(mapped.anomaly) ?? null : null,
      relatedClassifications: mapped.anomaly ? relatedByParent.get(Number(mapped.anomaly)) || [] : [],
    };
  });

  return NextResponse.json(recursiveSerialize({ locations: payload }));
}
