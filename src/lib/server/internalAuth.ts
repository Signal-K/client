import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

// Operator-only endpoints (SSC-37/SSC-39: snapshot refresh, job fan-out,
// dead-letter replay) take `Authorization: Bearer $INTERNAL_JOBS_TOKEN`.
// Without the secret configured they are disabled rather than open.
export function requireInternalToken(request: Request, env: NodeJS.ProcessEnv = process.env): NextResponse | null {
  const expected = env.INTERNAL_JOBS_TOKEN;
  if (!expected) return NextResponse.json({ error: "Internal endpoints are disabled (INTERNAL_JOBS_TOKEN unset)" }, { status: 503 });

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
