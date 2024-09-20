import { NextRequest, NextResponse } from "next/server";

interface ResearchedStructureItem {
    id: number;
    name: string;
    description?: string;
    icon_url: string;
    requires?: number; // Does it require a research ticket previously?
    requiresMission?: number;
    usedFor?: number; // Mission
    classificationType?: string;
    item?: number; // Points to an entry in `/api/gameplay/inventory`
    chapter: number;
};

const ResearchedStructures: ResearchedStructureItem[] = [
    {
        id: 1,
        name: "Telescope",
        description: 'Used to discover new planet candidates and other space entities',
        icon_url: '/assets/Items/Telescope.png',
        requiresMission: 1370203,
        usedFor: 1372001,
        classificationType: 'planet',
        item: 3103,
        chapter: 1,
    },
    {
        id: 2,
        name: "Rover camera receiver",
        description: 'Used to decode messages from your rover and learn more about the terrain of your planet',
        icon_url: '/assets/Items/CameraReceiver.png',
        requiresMission: 1370203,
        usedFor: 13714101,
        classificationType: 'roverImg',
        item: 3102,
        chapter: 1,
    },
    {
        id: 3,
        name: "Lidar module",
        description: 'Collect and study weather events and entitie',
        icon_url: '/assets/Items/Scoper.png',
        requiresMission: 1370203,
        usedFor: 137121301,
        classificationType: 'clouds',
        item: 3105,
        chapter: 1,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(ResearchedStructures);
};