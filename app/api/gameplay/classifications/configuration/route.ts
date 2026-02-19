import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type ConfigurationBody = {
  classificationId?: number | string;
  action?: "increment_vote" | "merge";
  patch?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ConfigurationBody;
  const classificationId = Number(body?.classificationId);
  const action = body?.action;

  if (!Number.isFinite(classificationId) || (action !== "increment_vote" && action !== "merge")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: classification, error: classificationError } = await supabase
    .from("classifications")
    .select("id, classificationConfiguration")
    .eq("id", classificationId)
    .single();

  if (classificationError || !classification) {
    return NextResponse.json({ error: classificationError?.message || "Classification not found" }, { status: 404 });
  }

  const existingConfig = (classification.classificationConfiguration as Record<string, unknown>) || {};
  let updatedConfiguration: Record<string, unknown>;

  if (action === "increment_vote") {
    const currentVotes = typeof existingConfig.votes === "number" ? existingConfig.votes : 0;
    updatedConfiguration = {
      ...existingConfig,
      votes: currentVotes + 1,
    };
  } else {
    const patch = body?.patch && typeof body.patch === "object" ? body.patch : null;
    if (!patch) {
      return NextResponse.json({ error: "Missing patch payload" }, { status: 400 });
    }
    updatedConfiguration = {
      ...existingConfig,
      ...patch,
    };
  }

  const { error: updateError } = await supabase
    .from("classifications")
    .update({ classificationConfiguration: updatedConfiguration })
    .eq("id", classificationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  revalidatePath(`/posts/${classificationId}`);
  revalidatePath(`/planets/${classificationId}`);
  revalidatePath("/activity/deploy");

  return NextResponse.json({
    success: true,
    classificationId,
    classificationConfiguration: updatedConfiguration,
  });
}
