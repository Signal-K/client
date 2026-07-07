import { NextResponse } from "next/server";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pb = await createPocketbaseAdminClient();
    const rows = await pb.collection("classifications").getList(1, 12, {
      filter: pb.filter("createdAt >= {:d}", { d: since.toISOString() }),
      sort: "-createdAt",
      fields: "legacyId,author,classificationtype,createdAt",
    });

    return NextResponse.json(
      rows.items.map((r) => ({
        id: r.legacyId,
        author: (r.author as string | null)?.slice(0, 8) ?? "user",
        type: r.classificationtype,
        at: r.createdAt,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
