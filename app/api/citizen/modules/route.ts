import { NextRequest, NextResponse } from "next/server";

export interface CitizenScienceModule {
  id: number;
  name: string;
  level?: number; // aka chapter
  starterMission?: number;
  structure: number;
  description?: string;
}

export interface Mission {
  id: number;
  name: string;
  description?: string;
  rewards?: number[];
  classificationModule?: string;
  classificationType?: string;
  structure: number;
  chapter?: string;
}

const modules: CitizenScienceModule[] = [
  {
    id: 1,
    name: "Planet Candidate Identification",
    level: 1,
    starterMission: 1372001,
    structure: 3103,
    description: 'Use your telescope [on your planet] to search for new planet candidates to travel to', // "like in the onboarding?"
  },
  {
    id: 2,
    name: "Animal Observations",
    level: 1,
    starterMission: 1370202,
    structure: 3104,
    description: "Central command has given you some animals from Earth to study their behaviour on {planetName}. Use the cameras in your base to keep track",
  },
//   {
//     id: 21,
//     name: "Animal uploader",
//     level: 1,
//     starterMission: 1370202,
//     structure: 3104,
//   },
  {
    id: 4,
    name: "Cloud identification",
    level: 1,
    starterMission: 137121301,
    structure: 3105,
    description: 'The LIDAR module can be used to track weather events and understand more about cloud features',
  },
  {
    id: 5,
    name: "Map the terrain (of your planet)",
    level: 1,
    starterMission: 13714101,
    structure: 3102,
    description: "Your rovers have been busy taking photos of the landscape, study their photos to find mineral deposits and map out your planet's terrain",
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(modules);
};