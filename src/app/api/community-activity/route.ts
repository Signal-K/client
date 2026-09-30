import { NextRequest, NextResponse } from "next/server";

import { readSnapshot, snapshotHeaders } from "@/src/server/snapshots/store";

export const dynamic = "force-dynamic";

const VISIBLE = 12;

// SSC-37: recent classifications from the precomputed `community-activity`
// snapshot. Missing data is an empty list (the UI hides the lane);
// `x-snapshot-status` says why.
export async function GET(request: NextRequest) {
  const exclude = request.nextUrl.searchParams.get("exclude") || "";
  const snapshot = await readSnapshot("community-activity");
  const items = (snapshot.data ?? [])
    .filter((r) => !exclude || r.authorId !== exclude)
    .slice(0, VISIBLE)
    .map(({ id, author, type, at }) => ({ id, author, type, at }));
  const headers = snapshotHeaders(snapshot);
  // `exclude` makes the response per-user.
  if (exclude) headers["cache-control"] = "private, max-age=60";
  return NextResponse.json(items, { headers });
}
