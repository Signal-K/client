import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discoveryParam = request.nextUrl.searchParams.get("discovery");
  let rows: Array<Record<string, unknown>> = [];
  if (discoveryParam) {
    const discovery = Number(discoveryParam);
    if (!Number.isFinite(discovery)) {
      return NextResponse.json({ error: "Invalid discovery" }, { status: 400 });
    }
    rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, mineralconfiguration, location, "roverName", created_at, discovery
      FROM "mineralDeposits"
      WHERE owner = ${user.id}
        AND discovery = ${discovery}
        AND location IS NOT NULL
      ORDER BY created_at DESC
    `;
  } else {
    rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, mineralconfiguration, location, "roverName", created_at, discovery
      FROM "mineralDeposits"
      WHERE owner = ${user.id}
        AND location IS NOT NULL
      ORDER BY created_at DESC
    `;
  }

  return NextResponse.json({ deposits: rows });
}

type MineralDepositBody = {
  anomaly?: number | string | null;
  discovery?: number | string | null;
  owner?: string | null;
  mineralconfiguration?: Record<string, unknown>;
  mineralConfiguration?: Record<string, unknown>;
  location?: string | null;
  roverName?: string | null;
  created_at?: string;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as MineralDepositBody;
  const anomaly = body?.anomaly == null ? null : Number(body.anomaly);
  const discovery = body?.discovery == null ? null : Number(body.discovery);

  if (!Number.isFinite(anomaly) || !Number.isFinite(discovery)) {
    return NextResponse.json({ error: "Invalid anomaly or discovery value" }, { status: 400 });
  }

  const mineralconfiguration =
    (body?.mineralconfiguration as Record<string, unknown> | undefined) ||
    (body?.mineralConfiguration as Record<string, unknown> | undefined) ||
    {};

  const payload = {
    anomaly,
    discovery,
    owner: user.id,
    mineralconfiguration,
    location: typeof body?.location === "string" ? body.location : "Mars",
    roverName: typeof body?.roverName === "string" ? body.roverName : "Rover 1",
    created_at: typeof body?.created_at === "string" ? body.created_at : new Date().toISOString(),
  };

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    INSERT INTO "mineralDeposits" (anomaly, discovery, owner, mineralconfiguration, location, "roverName", created_at)
    VALUES (
      ${payload.anomaly},
      ${payload.discovery},
      ${payload.owner},
      ${JSON.stringify(payload.mineralconfiguration)}::jsonb,
      ${payload.location},
      ${payload.roverName},
      ${payload.created_at}
    )
    RETURNING *
  `;
  const data = rows[0];

  revalidatePath("/inventory");
  revalidatePath("/viewports/roover");
  revalidatePath(`/next/${discovery}`);

  return NextResponse.json(data);
}
