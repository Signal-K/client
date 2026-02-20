import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

type ConfigurationBody = {
  classificationId?: number | string;
  action?: "increment_vote" | "merge";
  patch?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ConfigurationBody;
  const classificationId = Number(body?.classificationId);
  const action = body?.action;

  if (!Number.isFinite(classificationId) || (action !== "increment_vote" && action !== "merge")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const rows = await prisma.$queryRaw<Array<{ id: number; classificationConfiguration: Record<string, unknown> | null }>>`
    SELECT id, "classificationConfiguration"
    FROM classifications
    WHERE id = ${classificationId}
    LIMIT 1
  `;
  const classification = rows[0];
  if (!classification) return NextResponse.json({ error: "Classification not found" }, { status: 404 });

  const existingConfig = (classification.classificationConfiguration as Record<string, unknown>) || {};
  let updatedConfiguration: Record<string, unknown>;

  if (action === "increment_vote") {
    const currentVotes = typeof existingConfig.votes === "number" ? existingConfig.votes : 0;
    updatedConfiguration = {
      ...existingConfig,
      votes: currentVotes + 1,
    };
  } else {
    const patch = body?.patch && typeof body.patch === "object" ? body.patch : null;
    if (!patch) {
      return NextResponse.json({ error: "Missing patch payload" }, { status: 400 });
    }
    updatedConfiguration = {
      ...existingConfig,
      ...patch,
    };
  }

  await prisma.$executeRaw`
    UPDATE classifications
    SET "classificationConfiguration" = ${JSON.stringify(updatedConfiguration)}::jsonb
    WHERE id = ${classificationId}
  `;

  revalidatePath(`/posts/${classificationId}`);
  revalidatePath(`/planets/${classificationId}`);
  revalidatePath("/activity/deploy");

  return NextResponse.json({
    success: true,
    classificationId,
    classificationConfiguration: updatedConfiguration,
  });
}
