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
        id: 100001,
        name: "Initialise Mercury",
        anomaly: 10,
    }, 
    {
        id: 200001,
        name: "Initialise Venus",
        anomaly: 20,
    },
    {
        id: 300001,
        name: "Initialise Earth",
        anomaly: 69,
    },
    {
        id: 3000011,
        name: "Initialise Moon",
        anomaly: 11,
    },
    {
        id: 400001,
        name: "Initialise Mars",
        anomaly: 40,
    },
    {
        id: 400011,
        name: "Initialise Phobos",
        anomaly: 41,
    },
    {
        id: 400021,
        name: "Initialise Deimos",
        anomaly: 42,
    },
    {
        id: 500001,
        name: "Initialise Jupiter",
        anomaly: 50,
    },
    {
        id: 500011,
        name: "Initialise Amalthea",
        anomaly: 51,
    },
    {
        id: 500021,
        name: "Initialise Io",
        anomaly: 52,
    },
    {
        id: 500031,
        name: "Initialise Callisto",
        anomaly: 53,
    },
    {
        id: 500041,
        name: "Initialise Ganymede",
        anomaly: 54,
    },
    {
        id: 500051,
        name: "Initialise Europa",
        anomaly: 55,
    },
    {
        id: 600001,
        name: "Initialise Saturn",
        anomaly: 60,
    },
    {
        id: 700001,
        name: "Initialise Uranus",
        anomaly: 70,
    },
    {
        id: 800001,
        name: "Initialise Neptune",
        anomaly: 80,
    },
];

export async function GET(req: NextRequest) {
    return NextResponse.json(planetInitialisationMissions);
};