import { NextResponse } from "next/server";

import { readAllSnapshots } from "@/src/server/snapshots/store";

export const dynamic = "force-dynamic";

// SSC-37: freshness of every published snapshot, including the last refresh
// error, so a failing cron is visible without Cloudflare dashboard access.
export async function GET() {
  const snapshots = await readAllSnapshots();
  const healthy = snapshots.every((s) => s.status === "fresh");
  return NextResponse.json(
    {
      healthy,
      snapshots: snapshots.map(({ name, status, generatedAt, ageSeconds, lastAttemptAt, lastError }) => ({
        name,
        status,
        generatedAt,
        ageSeconds,
        lastAttemptAt,
        lastError,
      })),
    },
    { headers: { "cache-control": "public, max-age=30" } },
  );
}
