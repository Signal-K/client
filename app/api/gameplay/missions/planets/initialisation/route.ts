import { NextRequest, NextResponse } from "next/server";
// import { Mission } from "@/types/Missions";

export interface Mission {
    id: number;
    name: string;
    description?: string;
    rewards?: number[];
    anomaly?: number;
};

const planetInitialisationMissions: Mission[] = [
    {
        id: 300001,
        name: "Initialise Earth",
        anomaly: 69,
    },
    {
        id: 400001,
        name: "Initialise Mars",
        anomaly: 40,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(planetInitialisationMissions);
};