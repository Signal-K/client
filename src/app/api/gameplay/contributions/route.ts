import { NextRequest, NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { recordContribution } from "@/lib/server/contributions";
import { getRouteUser } from "@/lib/server/routeAuth";
import { isContributionKind } from "@/src/lib/gameplay/contributions";

export const dynamic = "force-dynamic";

// SSC-48: report today's contribution to the ecosystem ledger. The classify
// routes already do this on the server; this route is for contributions that
// have no server route of their own (for example a sky event). The server picks
// the day, the player is the Clerk subject, and the answer is always cheap:
// one write at most, no reads. "unavailable" is a 202, never an error the
// player sees.
export async function POST(request: NextRequest) {
  const { user } = await getRouteUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!isContributionKind(body?.kind)) {
    return NextResponse.json({ error: "Unknown contribution kind" }, { status: 400 });
  }

  let pb;
  try {
    pb = await createPocketbaseAdminClient();
  } catch {
    return NextResponse.json({ ok: false, reason: "ledger-unavailable" }, { status: 202 });
  }

  const result = await recordContribution(pb, user.id, body.kind);
  if (result === "unavailable") {
    return NextResponse.json({ ok: false, reason: "ledger-unavailable" }, { status: 202 });
  }
  return NextResponse.json({ ok: true, counted: result === "recorded" });
}
