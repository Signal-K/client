import { NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: classifications, error } = await supabase
    .from("classifications")
    .select("classificationtype")
    .eq("author", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const types = Array.from(
    new Set(
      (classifications || [])
        .map((c: any) => c.classificationtype)
        .filter(Boolean)
    )
  ) as string[];

  const toolCounts = types.reduce(
    (acc, type) => {
      if (["planet", "telescope-minorPlanet", "sunspot", "active-asteroid"].includes(type)) acc.telescope++;
      else if (["balloon-marsCloudShapes", "cloud", "lidar-jovianVortexHunter", "satellite-planetFour"].includes(type))
        acc.satellite++;
      else if (["automaton-aiForMars"].includes(type)) acc.rover++;
      return acc;
    },
    { telescope: 0, satellite: 0, rover: 0 }
  );

  return NextResponse.json({
    totalClassifications: classifications?.length || 0,
    classificationTypes: types,
    toolsUsed: toolCounts,
  });
}

