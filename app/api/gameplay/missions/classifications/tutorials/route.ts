import { NextRequest, NextResponse } from "next/server";

export interface Mission {
    id: number;
    name: string;
    sequence?: number;
    description?: string;
    rewards?: number[];
    classificationModule?: string;
    structure?: number;
    chapter?: number;
    component?: React.ComponentType<any>;
};

const classificationTutorialMissions: Mission[] = [
    {
        id: 3000001,
        name: "First planet classification",
        description: "Telescope > Lightkurve",
    },
    {
        id: 3000002,
        name: "First burrowing owl classification",
        description: "Zoodex > zoodexBurrowingOwl",
    },
    {
        id: 3000003,
        name: "First sunspot classification",
        description: "Telescope > telescopeSunspot", 
    },
    {
        id: 3000004,
        name: "First iguana classification",
        description: "Zoodex > zoodexIguanasFromAbove",
    },
    {
        id: 3000005,
        name: "First nest classification",
        description: "Zoodex > zoodexNestQuestGo",
    },  
    {
        id: 3000006,
        name: "First south coast fauan recovery classification",
        description: "Zoodex > zoodexSouthCoastFaunaRecovery",
    },
    {
        id: 3000007,
        name: "First fish classification",
        description: "Zoodex > zoodexFishResearch",
    },
    {
        id: 3000008,
        name: "First plant classification",
        description: "Zoodex > zoodexTestTubePlant",
    },
    {
        id: 3000009,
        name: "First Disk Detective classification",
        description: "Zoodex > zoodexDiskDetective",
    },
    {
        id: 3000010,
        name: "First martian cloud classification",
        description: "Zoodex > zoodexMartianClouds",
    },
    {
        id: 3000011,
        name: "First mars rover classification",
        description: "AutomatonStation > roverPhotos",
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(classificationTutorialMissions);
};