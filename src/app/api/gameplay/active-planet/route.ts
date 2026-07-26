import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow, mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";
import { getRouteUser } from "@/lib/server/routeAuth";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

async function resolveLocation(
  pb: Awaited<ReturnType<typeof createPocketbaseAdminClient>>,
  userId: string,
  requestedLocation?: number
) {
  const profile = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:userId}", { userId }))
    .catch(() => null);

  if (requestedLocation !== undefined && Number.isFinite(requestedLocation)) {
    if (profile) {
      await pb.collection("profiles").update(profile.id, { location: requestedLocation });
    } else {
      await pb.collection("profiles").create({
        userId,
        location: requestedLocation,
        updatedAt: new Date().toISOString(),
      });
    }

    return requestedLocation as number;
  }

  const location = profile?.location ?? 30;
  if (profile?.location == null) {
    if (profile) {
      await pb.collection("profiles").update(profile.id, { location });
    } else {
      await pb.collection("profiles").create({
        userId,
        location,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return location;
}

async function fetchActivePlanetPayload(userId: string, requestedLocation?: number) {
  const { user, authError } = await getRouteUser();
  if (authError || !user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pb = await createPocketbaseAdminClient();
    const location = await resolveLocation(pb, userId, requestedLocation);

    const [planet, classifications] = await Promise.all([
      pb
        .collection("anomalies")
        .getFirstListItem(pb.filter("legacyId = {:location}", { location }))
        .catch(() => null),
      pb.collection("ss_classifications").getFullList({
        filter: pb.filter("author = {:author} && anomaly = {:location} && classificationtype = {:type}", {
          author: userId,
          location,
          type: "lightcurve",
        }),
      }),
    ]);

    const planetRow = planet ? mapAnomalyToRow(planet) : null;

    return NextResponse.json(recursiveSerialize({
      location: location.toString(),
      planet: planetRow ? { ...planetRow, id: planetRow.id.toString() } : null,
      classifications: classifications.map((classification) => {
        const c = mapClassificationToRow(classification);
        return {
          ...c,
        id: c.id.toString(),
        anomaly: c.anomaly?.toString(),
        };
      }),
    }));
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load active planet data" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  return fetchActivePlanetPayload(userId);
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    userId?: string;
    location?: number | string;
  };

  if (!body.userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const requestedLocation = Number(body.location);
  if (!Number.isFinite(requestedLocation)) {
    return NextResponse.json({ error: "Invalid location" }, { status: 400 });
  }

  return fetchActivePlanetPayload(body.userId, requestedLocation);
}
