import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type BulkBody = {
  deposits?: Array<Record<string, unknown>>;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as BulkBody;
  const deposits = Array.isArray(body?.deposits) ? body.deposits : [];
  if (deposits.length === 0) {
    return NextResponse.json({ error: "No deposits provided" }, { status: 400 });
  }

  const normalized = deposits.map((row) => ({
    ...row,
    owner: user.id,
  }));

  const { data, error } = await supabase.from("mineralDeposits").insert(normalized).select("id");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/inventory");
  revalidatePath("/viewports/roover");

  return NextResponse.json({ success: true, count: data?.length || 0 });
}
