import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

const ALLOWED_TECHS = new Set([
  "probereceptors",
  "satellitecount",
  "roverwaypoints",
  "spectroscopy",
  "findMinerals",
  "p4Minerals",
  "roverExtraction",
  "satelliteExtraction",
  "ngtsAccess",
  "planet-hunters",
  "asteroid-hunting",
  "planet-exploration",
  "cloudspotting",
  "active-asteroids",
]);

const QUANTITY_UPGRADES = new Set(["probereceptors", "satellitecount", "roverwaypoints"]);
const ONE_TIME_UPGRADES = new Set([
  "spectroscopy",
  "findMinerals",
  "p4Minerals",
  "roverExtraction",
  "satelliteExtraction",
  "ngtsAccess",
  "planet-hunters",
  "asteroid-hunting",
  "planet-exploration",
  "cloudspotting",
  "active-asteroids",
]);

function techCost(techType: string) {
  return QUANTITY_UPGRADES.has(techType) ? 10 : 2;
}

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const techType = typeof body?.techType === "string" ? body.techType : "";

  if (!ALLOWED_TECHS.has(techType)) {
    return NextResponse.json({ error: "Invalid tech type" }, { status: 400 });
  }

  const userId = user.id;
  const [{ data: researched, error: researchedError }, { count: classificationCount, error: countError }] =
    await Promise.all([
      supabase.from("researched").select("tech_type").eq("user_id", userId),
      supabase.from("classifications").select("id", { count: "exact", head: true }).eq("author", userId),
    ]);

  if (researchedError || countError) {
    return NextResponse.json(
      {
        error: researchedError?.message || countError?.message || "Failed to validate unlock",
      },
      { status: 500 }
    );
  }

  const researchedRows = researched || [];
  const researchedSet = new Set(researchedRows.map((r) => r.tech_type));

  const existingCount = researchedRows.filter((r) => r.tech_type === techType).length;
  if (ONE_TIME_UPGRADES.has(techType) && existingCount > 0) {
    return NextResponse.json({ error: "Upgrade already unlocked" }, { status: 409 });
  }
  if (QUANTITY_UPGRADES.has(techType) && existingCount > 0) {
    return NextResponse.json({ error: "Upgrade maxed out" }, { status: 409 });
  }

  if (techType === "roverExtraction" && !researchedSet.has("findMinerals")) {
    return NextResponse.json({ error: "Requires findMinerals first" }, { status: 400 });
  }
  if (techType === "satelliteExtraction" && !researchedSet.has("p4Minerals")) {
    return NextResponse.json({ error: "Requires p4Minerals first" }, { status: 400 });
  }
  if (techType === "ngtsAccess") {
    const { count: planetCount, error: planetCountError } = await supabase
      .from("classifications")
      .select("id", { count: "exact", head: true })
      .eq("author", userId)
      .eq("classificationtype", "planet");

    if (planetCountError) {
      return NextResponse.json({ error: planetCountError.message }, { status: 500 });
    }
    if ((planetCount || 0) < 4) {
      return NextResponse.json({ error: "Requires 4 planet classifications" }, { status: 400 });
    }
  }

  const spent = researchedRows.reduce((total, row) => total + techCost(row.tech_type), 0);
  const availableStardust = Math.max(0, (classificationCount || 0) - spent);
  const cost = techCost(techType);

  if (availableStardust < cost) {
    return NextResponse.json(
      { error: "Insufficient stardust", availableStardust, required: cost },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("researched").insert({
    user_id: userId,
    tech_type: techType,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath("/research");
  revalidatePath("/game");
  revalidatePath("/inventory");

  return NextResponse.json({ success: true });
}
