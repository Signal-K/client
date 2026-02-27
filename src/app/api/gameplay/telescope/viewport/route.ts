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

  const [
    { data: linkedData, error: linkedError },
    { data: userClassifications, error: userClassError },
    { data: allClassifications, error: allClassError },
  ] = await Promise.all([
    supabase
      .from("linked_anomalies")
      .select(
        `
          id,
          anomaly_id,
          anomalies:anomaly_id (
            id,
            content,
            ticId,
            anomalytype,
            type,
            radius,
            mass,
            density,
            gravity,
            temperatureEq,
            temperature,
            smaxis,
            orbital_period,
            classification_status,
            avatar_url,
            created_at,
            deepnote,
            lightkurve,
            configuration,
            parentAnomaly,
            anomalySet,
            anomalyConfiguration
          )
        `
      )
      .eq("author", userId)
      .in("automaton", ["Telescope", "TelescopePlanet"])
      .not("anomalies", "is", null),
    supabase
      .from("classifications")
      .select("id, created_at, content, author, anomaly, media, classificationtype, classificationConfiguration")
      .eq("author", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("classifications")
      .select("id, created_at, content, author, anomaly, media, classificationtype, classificationConfiguration")
      .limit(50)
      .order("created_at", { ascending: false }),
  ]);

  if (linkedError || userClassError || allClassError) {
    return NextResponse.json(
      {
        error: linkedError?.message || userClassError?.message || allClassError?.message || "Failed to load viewport data",
      },
      { status: 500 }
    );
  }

  const anomalies = (linkedData || [])
    .map((link: any) => link.anomalies)
    .filter(Boolean);

  return NextResponse.json({
    anomalies,
    userClassifications: userClassifications || [],
    allClassifications: allClassifications || [],
    authenticated: true,
  });
}
