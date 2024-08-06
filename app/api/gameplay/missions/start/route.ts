import { NextRequest, NextResponse } from "next/server";

interface UserMissionInstance {
    id: number;
    user: string;
    time_of_completion: string;
    mission: number;
};

interface StarterMission {
    id: number;
    name: string;
    description: string; // There will be no rewards for starter missions
};

const starterMissions: StarterMission[] = [
    {
        id: 101, name: "Pick your planet", description: "Choose a planet that you'd like to settle on"
    },
    {
        id: 102, name: "Click on your first structure", description: ""
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(starterMissions);
}