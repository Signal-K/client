import { NextResponse } from "next/server";
import { getGamePageDataForUser } from "@/lib/server/game-page-data";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  let userId = "(unknown)";
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      console.error("[page-data] auth failed:", authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;
    console.log("[page-data] fetching for user:", userId);

    const data = await getGamePageDataForUser(userId);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[page-data] ERROR for user ${userId}:`, message);
    console.error(`[page-data] STACK:`, stack);

    if (message.includes("Can't reach database server") || message.includes("connect ECONNREFUSED")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    if (message.includes("relation") && message.includes("does not exist")) {
      return NextResponse.json({ error: "Database schema error" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error", detail: message }, { status: 500 });
  }
}
