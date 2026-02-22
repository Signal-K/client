import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST() {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error: linkedError } = await supabase
    .from("linked_anomalies")
    .delete()
    .eq("author", user.id)
    .eq("automaton", "Rover");

  if (linkedError) {
    return NextResponse.json({ error: linkedError.message }, { status: 500 });
  }

  const now = new Date();
  const utcDay = now.getUTCDay();
  const daysToLastSaturday = utcDay === 6 ? 0 : (utcDay + 1) % 7;
  const cutoff = new Date(now);
  cutoff.setUTCDate(now.getUTCDate() - daysToLastSaturday);
  cutoff.setUTCHours(14, 1, 0, 0);

  const { error: routeError } = await supabase
    .from("routes")
    .delete()
    .eq("author", user.id)
    .gte("timestamp", cutoff.toISOString());

  if (routeError) {
    return NextResponse.json({ error: routeError.message }, { status: 500 });
  }

  revalidatePath("/activity/deploy/roover");
  revalidatePath("/viewports/roover");
  revalidatePath("/game");

  return NextResponse.json({ success: true });
}
