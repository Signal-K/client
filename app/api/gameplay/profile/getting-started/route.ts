import { NextResponse } from "next/server";

import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classifications = await prisma.$queryRaw<Array<{ classificationtype: string | null }>>`
    SELECT classificationtype
    FROM classifications
    WHERE author = ${user.id}
  `;

  const types = Array.from(
    new Set(
      (classifications || [])
        .map((c: any) => c.classificationtype)
        .filter(Boolean)
    )
  ) as string[];

  const toolCounts = types.reduce(
    (acc, type) => {
      if (["planet", "telescope-minorPlanet", "sunspot", "active-asteroid"].includes(type)) acc.telescope++;
      else if (["balloon-marsCloudShapes", "cloud", "lidar-jovianVortexHunter", "satellite-planetFour"].includes(type))
        acc.satellite++;
      else if (["automaton-aiForMars"].includes(type)) acc.rover++;
      return acc;
    },
    { telescope: 0, satellite: 0, rover: 0 }
  );

  return NextResponse.json({
    totalClassifications: classifications.length,
    classificationTypes: types,
    toolsUsed: toolCounts,
  });
}
