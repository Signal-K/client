import { NextRequest, NextResponse } from 'next/server';

export interface ResearchLevelInfo {
  level: number;
  description: string;
};

const researchMappings: Record<string, ResearchLevelInfo[]> = {
  probecount: [
    { level: 1, description: '1 Probe' },
    { level: 2, description: '2 Probes' },
    { level: 3, description: '3 Probes' },
  ],
  proberange: [
    { level: 1, description: '100 Lightyears' },
    { level: 2, description: '500 Lightyears' },
    { level: 3, description: '1,000 Lightyears' },
    { level: 4, description: '5,000 Lightyears' },
    { level: 5, description: '10,000 Lightyears' },
  ],
  telescopepower: [
    { level: 1, description: 'Basic Magnification' },
    { level: 2, description: 'Medium Magnification' },
    { level: 3, description: 'High Magnification' },
    { level: 4, description: 'Ultra Deep Field' },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techType = searchParams.get('techType');
  const countStr = searchParams.get('count');

  if (!techType || !countStr) {
    return NextResponse.json({ error: 'Missing techType or count' }, { status: 400 });
  }

  const count = parseInt(countStr, 10);
  const levels = researchMappings[techType];

  if (!levels) {
    return NextResponse.json({ error: 'Invalid techType' }, { status: 400 });
  }

  const matchedLevel = levels.find((l) => l.level === count) || levels[levels.length - 1];

  return NextResponse.json({
    techType,
    count,
    description: matchedLevel.description,
  });
};