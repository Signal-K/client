import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

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
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
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

  const { data, error } = await supabase.from("mineralDeposits").insert(payload).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/inventory");
  revalidatePath("/viewports/roover");
  revalidatePath(`/next/${discovery}`);

  return NextResponse.json(data);
}
