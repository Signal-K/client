import { NextRequest, NextResponse } from "next/server";

interface ResearchedTravelMethod {
    id: number;
    name: string;
    description?: string;
    icon_url: string;
    requires?: number; // Does it require a research ticket previously?
    requiresMission?: number;
    // usedFor?: number; // Mission
};

const ResearchedTravelMethods: ResearchedTravelMethod[] = [
    {
        id: 94,
        name: "Intra-Solar System Travel",
        description: 'Travel to planets & moons within the solar system',
        icon_url: '/assets/Items/Rocket.png',
    },
    {
        id: 95,
        name: "Unmanned Probe Deployments",
        description: 'Deploy probes to planets & moons within the solar system',
        icon_url: '/assets/Items/Probe.png',
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(ResearchedTravelMethods);
};