import { NextRequest, NextResponse } from "next/server";

export interface CitizenScienceStructure {
    id: number;
    name: string;
    itemId: number; // points to `api/gameplay/inventory/route.ts`
    citizenScienceModule: number; // points to `api/citizen/modules/route.ts`
};

const citizenStructures: CitizenScienceStructure[] = [
    {
        id: 1, name: "Telescope", itemId: 3103, citizenScienceModule: 1,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(citizenStructures);
};