import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({
      anomalies: [],
      userClassifications: [],
      allClassifications: [],
      authenticated: false,
    });
  }

  const userId = user.id;

  try {
    // Step 1: fetch linked anomaly IDs — avoid PostgREST join syntax which can fail
    // if the FK relationship isn't detected in the Supabase schema cache.
    const { data: linkedRows, error: linkedError } = await supabase
      .from("linked_anomalies")
      .select("id, anomaly_id, classification_id")
      .eq("author", userId)
      .in("automaton", ["Telescope", "TelescopePlanet"]);

    if (linkedError) {
      console.error("[telescope/viewport] linked_anomalies fetch error:", linkedError.message);
      return NextResponse.json(
        { error: linkedError.message },
        { status: 500 }
      );
    }

    const anomalyIds = (linkedRows ?? [])
      .map((r: Record<string, unknown>) => r.anomaly_id)
      .filter((id): id is number => id != null);

    // Step 2: fetch anomaly details separately (avoids join/FK detection issues)
    let anomalies: Record<string, unknown>[] = [];
    if (anomalyIds.length > 0) {
      const { data: anomalyData, error: anomalyError } = await supabase
        .from("anomalies")
        .select(
          "id, content, ticId, anomalytype, type, radius, mass, density, gravity, temperatureEq, temperature, smaxis, orbital_period, classification_status, avatar_url, created_at, deepnote, lightkurve, configuration, parentAnomaly, anomalySet, anomalyConfiguration"
        )
        .in("id", anomalyIds);

      if (anomalyError) {
        // Degraded — return empty anomalies rather than a hard error
        console.error("[telescope/viewport] anomalies fetch error:", anomalyError.message);
      } else {
        anomalies = anomalyData ?? [];
      }
    }

    // Step 3: classifications
    const [
      { data: userClassifications, error: userClassError },
      { data: allClassifications, error: allClassError },
    ] = await Promise.all([
      supabase
        .from("classifications")
        .select(
          "id, created_at, content, author, anomaly, media, classificationtype, classificationConfiguration"
        )
        .eq("author", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("classifications")
        .select(
          "id, created_at, content, author, anomaly, media, classificationtype, classificationConfiguration"
        )
        .limit(50)
        .order("created_at", { ascending: false }),
    ]);

    if (userClassError || allClassError) {
      console.error(
        "[telescope/viewport] classifications fetch error:",
        userClassError?.message ?? allClassError?.message
      );
      return NextResponse.json(
        { error: userClassError?.message ?? allClassError?.message ?? "Failed to load classifications" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      anomalies,
      userClassifications: userClassifications ?? [],
      allClassifications: allClassifications ?? [],
      authenticated: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[telescope/viewport] unexpected error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
