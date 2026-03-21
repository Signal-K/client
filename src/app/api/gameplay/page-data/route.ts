import { NextResponse } from "next/server";
import { getGamePageDataForUser } from "@/lib/server/game-page-data";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await getPageData(user.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[page-data] Error for user ${user.id}:`, message);
    
    if (message.includes("Can't reach database server") || message.includes("PrismaClient")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    if (message.includes("relation") && message.includes("does not exist")) {
      return NextResponse.json({ error: "Database schema error" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error", message }, { status: 500 });
  }
}

async function getPageData(userId: string) {
  const data = await getGamePageDataForUser(userId);
  return NextResponse.json(data);
}
