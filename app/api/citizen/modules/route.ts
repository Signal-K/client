import { NextRequest, NextResponse } from "next/server";

export interface CitizenScienceModule {
    id: number;
    name: string;
    level?: number; // aka chapter
    starterMission?: number; // used to determine if a user has started it
    structure: number;
};

export interface Mission {
    id: number;
    name: string;
    description?: string;
    rewards?: number[];
    classificationModule?: string;
    structure: number;
    chapter?: string;
};

const modules: CitizenScienceModule[] = [
    {
        id: 1, name: "Planet Candidate Identification", level: 1, starterMission: 1372001, structure: 3103,
    },
    {
        id: 2, name: "Animal Observations", level: 1, starterMission: 1370202, structure: 3104,
    },
    {
        id: 21, name: "Animal uploader", level: 1, starterMission: 1370202, structure: 3104,
    },
    {
        id: 4, name: "Cloud identification", level: 1, starterMission: 137121301, structure: 3105,
    },
    {
        id: 5, name: "Map the terrain (of your planet)", level: 1, starterMission: 13714101, structure: 3102,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(modules);
};