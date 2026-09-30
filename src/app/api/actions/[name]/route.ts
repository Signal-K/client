import { NextResponse } from "next/server";

import { FORM_DATA_ARGS_HEADER } from "@/lib/actions/callAction";
import { serverActions } from "@/src/server/actions/registry";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const action = Object.prototype.hasOwnProperty.call(serverActions, name) ? serverActions[name] : undefined;
  if (!action) {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }

  let args: unknown[];
  try {
    if (request.headers.get(FORM_DATA_ARGS_HEADER) === "form-data") {
      args = [await request.formData()];
    } else {
      const body = (await request.json()) as { args?: unknown };
      args = Array.isArray(body?.args) ? body.args : [];
    }
  } catch {
    return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
  }

  try {
    const result = await action(...args);
    return NextResponse.json({ result: result ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 500 });
  }
}
