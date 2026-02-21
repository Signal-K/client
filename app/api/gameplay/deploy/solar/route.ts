import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export async function POST() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const weekStart = getWeekStart(now).toISOString();
  const automatonType = "TelescopeSolar";

  const [anomalies, existing] = await Promise.all([
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM anomalies
      WHERE "anomalySet" = 'sunspot'
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT id
      FROM linked_anomalies
      WHERE author = ${user.id}
        AND automaton = ${automatonType}
        AND date >= ${weekStart}
      LIMIT 1
    `,
  ]);

  if ((existing || []).length > 0) {
    return NextResponse.json({ success: true, inserted: 0 });
  }

  const rows = anomalies.map((anomaly) => ({
    author: user.id,
    anomaly_id: anomaly.id,
    automaton: automatonType,
    unlocked: false,
    date: now.toISOString(),
  }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No sunspot anomalies available" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO linked_anomalies (author, anomaly_id, automaton, unlocked, date)
    SELECT x.author, x.anomaly_id, x.automaton, x.unlocked, x.date::timestamptz
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      AS x(author text, anomaly_id int, automaton text, unlocked boolean, date text)
  `;

  revalidatePath("/viewports/solar");
  revalidatePath("/game");

  return NextResponse.json({ success: true, inserted: rows.length });
}
