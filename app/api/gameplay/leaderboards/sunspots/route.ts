import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [probeLeaders, classificationLeaders] = await Promise.all([
    prisma.$queryRaw<
      Array<{ user_id: string; username: string | null; full_name: string | null; avatar_url: string | null; count: number }>
    >`
      SELECT
        dp.user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        COALESCE(SUM(dp.count), 0)::int AS count
      FROM defensive_probes dp
      LEFT JOIN profiles p ON p.id = dp.user_id
      GROUP BY dp.user_id, p.username, p.full_name, p.avatar_url
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.$queryRaw<
      Array<{ user_id: string; username: string | null; full_name: string | null; avatar_url: string | null; count: number }>
    >`
      SELECT
        c.author AS user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        COUNT(*)::int AS count
      FROM classifications c
      LEFT JOIN profiles p ON p.id = c.author
      WHERE c.classificationtype = 'sunspot'
      GROUP BY c.author, p.username, p.full_name, p.avatar_url
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  return NextResponse.json({
    probeLeaders: probeLeaders.map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Anonymous",
      full_name: entry.full_name || "Unknown",
      avatar_url: entry.avatar_url,
      count: entry.count || 0,
    })),
    classificationLeaders: classificationLeaders.map((entry) => ({
      user_id: entry.user_id,
      username: entry.username || "Anonymous",
      full_name: entry.full_name || "Unknown",
      avatar_url: entry.avatar_url,
      count: entry.count || 0,
    })),
  });
}
