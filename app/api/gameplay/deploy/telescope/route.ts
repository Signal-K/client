import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type DeploymentType = "stellar" | "planetary";

type DeployBody = {
  deploymentType?: DeploymentType;
  anomalyIds?: number[];
};

function computeSetsToFetch(
  deploymentType: DeploymentType,
  options: { includeActiveAsteroids: boolean; includeNgts: boolean }
) {
  if (deploymentType === "stellar") {
    return ["diskDetective", "superwasp-variable", "telescope-superwasp-variable"];
  }

  const sets = ["telescope-tess", "telescope-minorPlanet"];
  if (options.includeActiveAsteroids) {
    sets.push("active-asteroids");
  }
  if (options.includeNgts) {
    sets.push("telescope-ngts");
  }
  return sets;
}

export async function GET(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");

  if (action === "anomalies") {
    const deploymentType = request.nextUrl.searchParams.get("deploymentType") as DeploymentType | null;
    if (deploymentType !== "stellar" && deploymentType !== "planetary") {
      return NextResponse.json({ error: "Invalid deploymentType" }, { status: 400 });
    }

    let includeActiveAsteroids = false;
    let includeNgts = false;

    if (deploymentType === "planetary") {
      const [{ count: minorPlanetCount, error: countError }, { data: ngtsData, error: ngtsError }] =
        await Promise.all([
          supabase
            .from("classifications")
            .select("id", { count: "exact", head: true })
            .eq("author", user.id)
            .eq("classificationtype", "telescope-minorPlanet"),
          supabase
            .from("researched")
            .select("tech_type")
            .eq("user_id", user.id)
            .eq("tech_type", "ngtsAccess")
            .limit(1),
        ]);

      if (countError || ngtsError) {
        return NextResponse.json(
          { error: countError?.message || ngtsError?.message || "Failed to load unlocks" },
          { status: 500 }
        );
      }

      includeActiveAsteroids = (minorPlanetCount || 0) >= 2;
      includeNgts = (ngtsData || []).length > 0;
    }

    const setsToFetch = computeSetsToFetch(deploymentType, {
      includeActiveAsteroids,
      includeNgts,
    });

    const { data, error } = await supabase.from("anomalies").select("*").in("anomalySet", setsToFetch);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ anomalies: data || [] });
  }

  if (action === "status") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [linkedRes, commentsRes, votesRes] = await Promise.all([
      supabase
        .from("linked_anomalies")
        .select("id")
        .eq("automaton", "Telescope")
        .eq("author", user.id)
        .gte("date", oneWeekAgo.toISOString()),
      supabase
        .from("comments")
        .select("id, classification:classifications(author)")
        .eq("author", user.id)
        .gte("created_at", oneWeekAgo.toISOString()),
      supabase
        .from("votes")
        .select("id, classification:classifications(author)")
        .eq("user_id", user.id)
        .eq("vote_type", "up")
        .gte("created_at", oneWeekAgo.toISOString()),
    ]);

    if (linkedRes.error || commentsRes.error || votesRes.error) {
      return NextResponse.json(
        {
          error:
            linkedRes.error?.message || commentsRes.error?.message || votesRes.error?.message || "Failed to load deployment status",
        },
        { status: 500 }
      );
    }

    const linkedCount = linkedRes.data?.length || 0;
    const validComments = (commentsRes.data || []).filter(
      (c: any) => c.classification?.author && c.classification.author !== user.id
    );
    const validVotes = (votesRes.data || []).filter(
      (v: any) => v.classification?.author && v.classification.author !== user.id
    );

    const additionalDeploys = Math.floor(validVotes.length / 3) + validComments.length;
    const userCanRedeploy = linkedCount + additionalDeploys > linkedCount;

    if (linkedCount === 0) {
      return NextResponse.json({ alreadyDeployed: false, deploymentMessage: null });
    }

    if (userCanRedeploy) {
      return NextResponse.json({
        alreadyDeployed: false,
        deploymentMessage: "You have earned additional deploys by interacting with the community this week!",
      });
    }

    return NextResponse.json({
      alreadyDeployed: true,
      deploymentMessage: "Telescope has already been deployed this week. Recalibrate & search again next week.",
    });
  }

  if (action === "skill-progress") {
    const start = new Date("2000-01-01").toISOString();

    const [telescopeRes, weatherRes] = await Promise.all([
      supabase
        .from("classifications")
        .select("id", { count: "exact", head: true })
        .eq("author", user.id)
        .in("classificationtype", ["planet", "telescope-minorPlanet"])
        .gte("created_at", start),
      supabase
        .from("classifications")
        .select("id", { count: "exact", head: true })
        .eq("author", user.id)
        .in("classificationtype", ["cloud", "lidar-jovianVortexHunter"])
        .gte("created_at", start),
    ]);

    if (telescopeRes.error || weatherRes.error) {
      return NextResponse.json(
        {
          error:
            telescopeRes.error?.message || weatherRes.error?.message || "Failed to load skill progress",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      skillProgress: {
        telescope: telescopeRes.count || 0,
        weather: weatherRes.count || 0,
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeployBody;
  const deploymentType = body?.deploymentType;
  const anomalyIds = Array.isArray(body?.anomalyIds)
    ? body.anomalyIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))
    : [];

  if (deploymentType !== "stellar" && deploymentType !== "planetary") {
    return NextResponse.json({ error: "Invalid deploymentType" }, { status: 400 });
  }

  if (anomalyIds.length === 0) {
    return NextResponse.json({ error: "No anomalies selected" }, { status: 400 });
  }

  const { data: upgradeRows, error: upgradeError } = await supabase
    .from("researched")
    .select("tech_type")
    .eq("user_id", user.id)
    .eq("tech_type", "probereceptors");

  if (upgradeError) {
    return NextResponse.json({ error: upgradeError.message }, { status: 500 });
  }

  const maxAnomalies = (upgradeRows || []).length > 0 ? 6 : 4;
  const uniqueIds = Array.from(new Set(anomalyIds)).slice(0, maxAnomalies);

  const rows = uniqueIds.map((anomalyId) => ({
    author: user.id,
    anomaly_id: anomalyId,
    classification_id: null,
    automaton: "Telescope",
  }));

  const { error } = await supabase.from("linked_anomalies").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/activity/deploy");
  revalidatePath("/structures/telescope");
  revalidatePath("/game");

  return NextResponse.json({ success: true, inserted: rows.length });
}
