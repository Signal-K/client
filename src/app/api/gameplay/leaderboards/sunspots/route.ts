import { NextResponse } from "next/server";

import { readSnapshot, snapshotHeaders } from "@/src/server/snapshots/store";

export const dynamic = "force-dynamic";

// SSC-37: served from the precomputed `sunspot-leaderboard` snapshot; the
// full-collection scan runs on the Worker's cron trigger, not per request.
export async function GET() {
  const snapshot = await readSnapshot("sunspot-leaderboard");
  if (!snapshot.data) {
    return NextResponse.json(
      { error: "Leaderboard is being prepared", status: snapshot.status },
      { status: 503, headers: snapshotHeaders(snapshot) },
    );
  }
  return NextResponse.json(
    { ...snapshot.data, status: snapshot.status, generatedAt: snapshot.generatedAt },
    { headers: snapshotHeaders(snapshot) },
  );
}
