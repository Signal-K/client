import { NextResponse } from "next/server";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

/** Recursively convert BigInt values to Number so JSON.stringify doesn't throw. */
function toBigIntSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === "bigint" ? Number(v) : v)),
  ) as T;
}

type ClassificationRow = {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: number | null;
  anomaly_content: string | null;
  classificationConfiguration?: unknown;
};

type LinkedAnomalyRow = {
  id: number;
  anomaly_id: number;
  date: string;
  automaton: string | null;
  unlocked?: boolean | null;
  anomaly_content: string | null;
  anomaly_type: string | null;
  anomaly_set: string | null;
};

function parseConfig(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await getPageData(user.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[page-data] Error for user ${user.id}:`, message);
    
    if (message.includes("Can't reach database server") || message.includes("PrismaClient")) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    if (message.includes("relation") && message.includes("does not exist")) {
      return NextResponse.json({ error: "Database schema error" }, { status: 503 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getPageData(userId: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const profileRows = await prisma.$queryRaw<
    Array<{ id: string; username: string | null; full_name: string | null; classificationPoints: number | null }>
  >`
    SELECT id, username, full_name, "classificationPoints"
    FROM profiles
    WHERE id::text = ${userId}
    LIMIT 1
  `;
  const profile = profileRows[0] ?? null;

  const myClassifications = await prisma.$queryRaw<ClassificationRow[]>`
    SELECT
      c.id,
      c.classificationtype,
      c.content,
      c.created_at,
      c.anomaly,
      c."classificationConfiguration",
      a.content AS anomaly_content
    FROM classifications c
    LEFT JOIN anomalies a ON a.id = c.anomaly
    WHERE c.author::text = ${userId}
    ORDER BY c.created_at DESC
    LIMIT 10
  `;

  const allUserClassifications = await prisma.$queryRaw<Array<{ anomaly: number | null }>>`
    SELECT anomaly
    FROM classifications
    WHERE author::text = ${userId}
  `;
  const classifiedAnomalyIds = new Set(
    allUserClassifications
      .map((row) => row.anomaly)
      .filter((value): value is number => Number.isFinite(Number(value)))
      .map((value) => Number(value))
  );

  const cloudClassifications = await prisma.$queryRaw<Array<{ anomaly: number | null }>>`
    SELECT anomaly
    FROM classifications
    WHERE author::text = ${userId}
      AND classificationtype = 'cloud'
  `;
  const classifiedCloudAnomalyIds = new Set(
    cloudClassifications
      .map((row) => row.anomaly)
      .filter((value): value is number => Number.isFinite(Number(value)))
      .map((value) => Number(value))
  );

  let linkedRows: LinkedAnomalyRow[] = [];
  try {
    linkedRows = await prisma.$queryRaw<LinkedAnomalyRow[]>`
      SELECT
        la.id,
        la.anomaly_id,
        la.date,
        la.automaton,
        la.unlocked,
        a.content AS anomaly_content,
        a.anomalytype AS anomaly_type,
        a."anomalySet" AS anomaly_set
      FROM linked_anomalies la
      LEFT JOIN anomalies a ON a.id = la.anomaly_id
      WHERE la.author::text = ${userId}
      ORDER BY la.date DESC
    `;
  } catch {
    linkedRows = await prisma.$queryRaw<LinkedAnomalyRow[]>`
      SELECT
        la.id,
        la.anomaly_id,
        la.date,
        la.automaton,
        a.content AS anomaly_content,
        a.anomalytype AS anomaly_type,
        a."anomalySet" AS anomaly_set
      FROM linked_anomalies la
      LEFT JOIN anomalies a ON a.id = la.anomaly_id
      WHERE la.author::text = ${userId}
      ORDER BY la.date DESC
    `;
  }

  const linkedAnomalies = linkedRows
    .filter((row) => {
      const isCloud = row.anomaly_type === "cloud";
      if (!classifiedAnomalyIds.has(row.anomaly_id)) return true;
      if (isCloud && classifiedCloudAnomalyIds.has(row.anomaly_id)) return true;
      return false;
    })
    .map((row) => ({
      id: row.id,
      anomaly_id: row.anomaly_id,
      date: row.date,
      automaton: row.automaton ?? undefined,
      unlocked: row.unlocked ?? undefined,
      anomaly: {
        id: row.anomaly_id,
        content: row.anomaly_content,
        anomalytype: row.anomaly_type,
        anomalySet: row.anomaly_set,
      },
    }));

  const myClassificationIds = myClassifications.map((c) => c.id);
  let comments: Array<{ created_at: string; content: string | null; classification_id: number; category: string | null }> = [];
  let votes: Array<{ created_at: string; vote_type: string; classification_id: number }> = [];
  if (myClassificationIds.length > 0) {
    comments = await prisma.$queryRaw<
      Array<{ created_at: string; content: string | null; classification_id: number; category: string | null }>
    >(Prisma.sql`
      SELECT created_at, content, classification_id, category
      FROM comments
      WHERE classification_id IN (${Prisma.join(myClassificationIds)})
        AND created_at >= ${oneWeekAgo}
    `);

    votes = await prisma.$queryRaw<Array<{ created_at: string; vote_type: string; classification_id: number }>>(Prisma.sql`
      SELECT created_at, vote_type, classification_id
      FROM votes
      WHERE classification_id IN (${Prisma.join(myClassificationIds)})
        AND created_at >= ${oneWeekAgo}
    `);
  }

  const activityFeed = [
    ...comments.map((c) => ({ type: "comment" as const, ...c })),
    ...votes.map((v) => ({ type: "vote" as const, ...v })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const otherClassifications = await prisma.$queryRaw<
    Array<{ id: number; classificationtype: string | null; content: string | null; author: string; created_at: string }>
  >`
    SELECT id, classificationtype, content, author, created_at
    FROM classifications
    WHERE author::text <> ${userId}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const transformedClassifications = myClassifications.map((row) => ({
    id: row.id,
    classificationtype: row.classificationtype,
    content: row.content,
    created_at: row.created_at,
    anomaly: {
      content: row.anomaly_content,
    },
    classificationConfiguration: parseConfig(row.classificationConfiguration),
  }));

  const planetClassifications = transformedClassifications.filter((c) => c.classificationtype === "planet");
  const classificationIdsWithRadius = new Set(
    comments.filter((c) => c.category === "Radius").map((c) => c.classification_id)
  );
  const incompletePlanet = planetClassifications.find((c) => !classificationIdsWithRadius.has(c.id)) ?? null;

  const planetTargets = planetClassifications
    .filter((c) => classificationIdsWithRadius.has(c.id))
    .map((c) => ({ id: c.id, name: c.anomaly?.content ?? `Planet #${c.id}` }));

  const roverDeposits = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id
    FROM "mineralDeposits"
    WHERE owner::text = ${userId}
      AND "roverName" IS NOT NULL
    LIMIT 1
  `;
  const hasRoverMineralDeposits = roverDeposits.length > 0;

  const visibleStructures = {
    telescope: true,
    satellites: transformedClassifications.length > 0,
    rovers: transformedClassifications.filter((c) => c.classificationtype === "planet").length >= 5,
    balloons: transformedClassifications.length >= 10,
  };

  return NextResponse.json(toBigIntSafe({
    profile,
    classifications: transformedClassifications,
    linkedAnomalies,
    activityFeed,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    hasRoverMineralDeposits,
  }));
}
