import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/routeAuth";
import { loadHubState, upsertHubState } from "@/lib/server/hubState";
import type { HubOnboarding } from "@/src/features/onboarding/hubState";
import { hydrateGardenState } from "@/src/features/garden/gardenLogic";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await loadHubState(user.id);
  return NextResponse.json(state);
}

export async function PATCH(request: Request) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    onboarding?: Partial<HubOnboarding>;
    garden?: unknown;
  };

  const hasOnboarding = !!body.onboarding && typeof body.onboarding === "object";
  const hasGarden = Object.prototype.hasOwnProperty.call(body, "garden");

  if (!hasOnboarding && !hasGarden) {
    return NextResponse.json({ error: "No valid patch fields provided" }, { status: 400 });
  }

  const { state, persisted } = await upsertHubState(user.id, {
    ...(hasOnboarding ? { onboarding: body.onboarding } : {}),
    ...(hasGarden ? { garden: body.garden == null ? null : hydrateGardenState(body.garden) } : {}),
  });

  return NextResponse.json({ ...state, persisted });
}
