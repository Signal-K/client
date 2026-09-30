import { NextResponse } from "next/server";

import { isSnapshotName, readSnapshot, snapshotDefinitions, snapshotHeaders } from "@/src/server/snapshots/store";

export const dynamic = "force-dynamic";

// SSC-37: public, precomputed data. Reads the published KV snapshot only; the
// cron trigger does the PocketBase work. 503 until the first refresh lands.
export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!isSnapshotName(name) || !snapshotDefinitions[name].public) {
    return NextResponse.json({ error: "Unknown snapshot" }, { status: 404 });
  }

  const snapshot = await readSnapshot(name);
  const body = {
    name,
    status: snapshot.status,
    generatedAt: snapshot.generatedAt,
    ageSeconds: snapshot.ageSeconds,
    data: snapshot.data,
  };
  return NextResponse.json(body, { status: snapshot.status === "missing" ? 503 : 200, headers: snapshotHeaders(snapshot) });
}
