import { NextRequest, NextResponse } from "next/server";

interface ResearchedAutomatonComponent {
    id: number;
    name: string;
    item?: number; // What does this affect (entry in /api/gameplay/inventory)
    requires?: number;
    ability?: number;
    requiresMission?: number;
};

interface AbilityResearch {
    id: number;
    name: string;
    item?: number; // What does this affect (entry in /api/gameplay/inventory)
};

const ResearchedAbilities: AbilityResearch[] = [
    {
        id: 1,
        name: "Speed",
        item: 23,
    },
    {
        id: 2,
        name: 'Power',
        item: 23,
    },
    {
        id: 3,
        name: "Capacity",
        item: 23,
    },
];

const ResearchedAutomatonComponents: ResearchedAutomatonComponent[] = [
    {
        id: 1,
        name: "Power Level 2", // Level 1 has already been "unlocked" at the start
        item: 23,
        ability: 2,
        requiresMission: 1370207
    },
    {
        id: 2,
        name: "Power Level 3",
        item: 23,
        ability: 2,
        requires: 1,
        requiresMission: 1370207,
    },
    {
        id: 3,
        name: "Capacity Level 2",
        item: 23,
        ability: 3,
        requiresMission: 1370207
    },
    {
        id: 4,
        name: "Capacity Level 3",
        item: 23,
        ability: 3,
        requires: 3,
        requiresMission: 1370207,
    },
    {
        id: 5,
        name: "Speed Level 2",
        item: 23,
        ability: 1,
        requiresMission: 1370207
    },
    {
        id: 6,
        name: "Speed Level 3",
        item: 23,
        ability: 1,
        requires: 5,
        requiresMission: 1370207,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(ResearchedAutomatonComponents);
};