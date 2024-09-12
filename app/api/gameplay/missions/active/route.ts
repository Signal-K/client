import { NextRequest, NextResponse } from "next/server";

interface UserActiveMission {
  id: number;
  name: string;
  level?: number; // aka chapter
  starterMission?: number;
  structure?: number;
  description?: string;
  createStructure?: number;
  mineralDepositToCreate?: number;
};

interface Mission {
  id: number;
  name: string;
  description?: string;
  rewards?: number[];
  classificationModule?: string;
  classificationType?: string;
  structure: number;
  chapter?: string;
};

const missions: UserActiveMission[] = [
    {
        id: 1,
        name: 'Initialise Chapter 1',
        starterMission: 1370201,
    },
    {
        id: 2,
        name: 'Choose your first classification',
        starterMission: 1370203,
    },
    {
        id: 3,
        name: 'Complete your first (on-planet) classification',
        starterMission: 1370204,
        // structure: null, -> should point towards active structure based on what the user chose, which I believe is being done with the <Stats .../> component
    },
    {
        id: 4,
        name: 'Go mining', // Create an automaton structure if the user doesn't already have this
        starterMission: 1370205,
        structure: 3102,
        createStructure: 3102,
        mineralDepositToCreate: 15,
    },
    {
        id: 5,
        name: 'Repair the research structure',
        starterMission: 1370206,
        structure: 3106,
        createStructure: 3106,
    },
    {
        id: 6,
        name: 'Research a new technology',
        starterMission: 1370207,
        structure: 3106,
    },
    {
        id: 7,
        name: ''
    }
];

export async function GET(req: NextRequest) {
    return NextResponse.json(missions);
  };