import { NextRequest, NextResponse } from "next/server";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pb = await createPocketbaseAdminClient();
    const exclude = request.nextUrl.searchParams.get("exclude") || "";

    const rows = await pb.collection("ss_classifications").getList(1, 12, {
      filter: pb.filter("createdAt >= {:d}", { d: since.toISOString() }),
      sort: "-createdAt",
      skipTotal: true,
      fields: "legacyId,author,classificationtype,createdAt",
    });

    return NextResponse.json(
      rows.items
        .filter((r) => !exclude || r.author !== exclude)
        .map((r) => ({
          id: r.legacyId,
          author: (r.author as string | null)?.slice(0, 8) ?? "user",
          type: r.classificationtype,
          at: r.createdAt,
        })),
      // Public, identical for every player (clients filter their own rows), so
      // the edge can answer most polls without touching PocketBase.
      { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch {
    return NextResponse.json([]);
  }
}
