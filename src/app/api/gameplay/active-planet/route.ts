import { NextRequest, NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

async function resolveLocation(
  supabase: Awaited<ReturnType<typeof getRouteSupabaseWithUser>>["supabase"],
  userId: string,
  requestedLocation?: number
) {
  if (Number.isFinite(requestedLocation)) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ location: requestedLocation })
      .eq("id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return requestedLocation as number;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("location")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const location = profile?.location ?? 30;
  if (profile?.location == null) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ location })
      .eq("id", userId);
    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return location;
}

async function fetchActivePlanetPayload(userId: string, requestedLocation?: number) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const location = await resolveLocation(supabase, userId, requestedLocation);

    const { data: planet, error: planetError } = await supabase
      .from("anomalies")
      .select("*")
      .eq("id", location)
      .maybeSingle();

    if (planetError) {
      throw new Error(planetError.message);
    }

    const { data: classifications, error: classificationsError } = await supabase
      .from("classifications")
      .select("*")
      .eq("author", userId)
      .eq("anomaly", location)
      .eq("classificationtype", "lightcurve");

    if (classificationsError) {
      throw new Error(classificationsError.message);
    }

    return NextResponse.json({
      location,
      planet: planet ?? null,
      classifications: classifications ?? [],
    });
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
