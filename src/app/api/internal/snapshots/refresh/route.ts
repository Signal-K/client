import { NextResponse } from "next/server";

import { requireInternalToken } from "@/lib/server/internalAuth";
import { refreshSnapshots } from "@/src/server/snapshots/store";

export const dynamic = "force-dynamic";

// SSC-37: publish the public snapshots now instead of waiting for the cron
// (for example straight after the first deploy).
export async function POST(request: Request) {
  const denied = requireInternalToken(request);
  if (denied) return denied;
  const report = await refreshSnapshots();
  return NextResponse.json(report, { status: report.results.every((r) => r.ok) ? 200 : 207 });
}
