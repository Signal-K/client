import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapMineralDepositToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const discoveryParam = request.nextUrl.searchParams.get("discovery");
  const pb = await createPocketbaseAdminClient();
  const filters = [pb.filter("owner = {:owner}", { owner: user.id }), 'location != ""'];

  if (discoveryParam) {
    const discovery = Number(discoveryParam);
    if (!Number.isFinite(discovery)) {
      return NextResponse.json(recursiveSerialize({ error: "Invalid discovery" }), { status: 400 });
    }
    filters.push(pb.filter("discovery = {:d}", { d: discovery }));
  }

  const rows = await pb.collection("mineral_deposits").getFullList({
    filter: filters.join(" && "),
    sort: "-createdAt",
  });

  return NextResponse.json(recursiveSerialize({ deposits: rows.map(mapMineralDepositToRow) }));
}

type MineralDepositBody = {
  anomaly?: number | string | null;
  discovery?: number | string | null;
  owner?: string | null;
  mineral_configuration?: Record<string, unknown>;
  mineralconfiguration?: Record<string, unknown>;
  mineralConfiguration?: Record<string, unknown>; // legacy fallback
  location?: string | null;
  rover_name?: string | null;
  roverName?: string | null;
  created_at?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json(recursiveSerialize({ error: "Unauthorized" }), { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as MineralDepositBody;
  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const discovery = body?.discovery == null ? null : Number(body.discovery);

  if (!Number.isFinite(anomaly) || !Number.isFinite(discovery)) {
    return NextResponse.json(recursiveSerialize({ error: "Invalid anomaly or discovery value" }), { status: 400 });
  }

  const mineralConfiguration =
    (body?.mineral_configuration as Record<string, unknown> | undefined) ||
    (body?.mineralconfiguration as Record<string, unknown> | undefined) ||
    (body?.mineralConfiguration as Record<string, unknown> | undefined) || // legacy fallback
    {};

  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("mineral_deposits").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  const created = await pb.collection("mineral_deposits").create({
    legacyId: nextLegacyId,
    anomaly,
    discovery,
    owner: user.id,
    mineralConfiguration,
    location: typeof body?.location === "string" ? body.location : "Mars",
    roverName:
      typeof body?.rover_name === "string"
        ? body.rover_name
        : typeof body?.roverName === "string"
          ? body.roverName
          : "Rover 1",
    createdAt: typeof body?.created_at === "string" ? body.created_at : new Date().toISOString(),
  });

  revalidatePath("/inventory");
  revalidatePath("/viewports/rover");
  revalidatePath(`/next/${discovery}`);

  return NextResponse.json(recursiveSerialize(mapMineralDepositToRow(created)));
}
