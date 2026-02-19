import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type SubscribeBody = {
  endpoint?: string;
  auth?: string;
  p256dh?: string;
};

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
  }

  const auth = typeof body?.auth === "string" ? body.auth : "";
  const p256dh = typeof body?.p256dh === "string" ? body.p256dh : "";

  const { data: existing, error: existingError } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("profile_id", user.id)
    .eq("endpoint", endpoint)
    .limit(1);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if ((existing || []).length > 0) {
    return NextResponse.json({ success: true, alreadyExists: true });
  }

  const { error } = await supabase.from("push_subscriptions").insert({
    profile_id: user.id,
    endpoint,
    auth,
    p256dh,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/game");
  return NextResponse.json({ success: true, alreadyExists: false });
}
