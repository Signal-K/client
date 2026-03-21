import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await prisma.classification.findMany({
      where: { createdAt: { gte: since } },
      select: {
        id: true,
        author: true,
        classificationtype: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        author: r.author?.slice(0, 8) ?? "sailor",
        type: r.classificationtype,
        at: r.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
