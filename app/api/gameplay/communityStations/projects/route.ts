import { NextRequest, NextResponse } from 'next/server';
import React from 'react';

import { BurrowingOwl } from '@/components/Projects/Zoodex/burrowingOwls';
import { ZoodexIguanas } from '@/components/Projects/Zoodex/iguanasFromAbove';

interface Project {
  id: string;
  name: string;
  identifier: string;
  component: React.ComponentType;
  missionRoute: number;
  structure: string;
  // isUnlocked: boolean; // Uncomment if needed
  // level: number; // Uncomment if needed
}

interface Mission {
  id: string;
  name: string;
  type: string;
  // completionRate: number; // Uncomment if needed
  project: string;
  // level: number; // Uncomment if needed
  // isUnlocked: boolean; // Uncomment if needed
}

interface CommunityStationConfig {
  stationName: string;
  inventoryItemId: number;
  projects: Project[];
  missions: Mission[];
}

const greenhouseStation: CommunityStationConfig = {
  stationName: "Greenhouse",
  inventoryItemId: 31011,
  projects: [
    {
      id: "1",
      name: "Wildwatch Burrowing Owls",
      identifier: "zoodex-burrowingOwls",
      component: BurrowingOwl,
      structure: "Zoodex",
      missionRoute: 3000002,
    },
    {
      id: "2",
      name: "Iguanas from Above",
      identifier: "zoodex-iguanasFromAbove",
      component: ZoodexIguanas,
      structure: "Zoodex",
      missionRoute: 3000004,
    },
  ],
  missions: [
    {
      id: "1",
      name: "Spot an owl in the wild",
      type: "Upload",
      project: "1",
    },
    {
      id: "2",
      name: "Track iguana movement",
      type: "Analysis",
      project: "2",
    },
  ],
};

const weatherBalloonStation: CommunityStationConfig = {
  stationName: "Weather balloon",
  inventoryItemId: 31012,
  projects: [],
  missions: [
    {
      id: "1",
      name: "Determine planet type to allow for population of relevant anomalies, and then attribute some clouds",
      type: "Upload",
      project: "1",
    },
  ],
};

const spaceTelescopeStation: CommunityStationConfig = {
  stationName: "Space telescope",
  inventoryItemId: 31013,
  projects: [],
  missions: [
    {
      id: "1",
      name: "Map planet type based on lightcurve information", // and then we can attribute/participate other missions/projects",
      type: "Upload",
      project: "1",
    },
  ],
};

export async function GET(req: NextRequest) {
  const response = {
    stations: [
      greenhouseStation,
      weatherBalloonStation,
      spaceTelescopeStation,
    ],
  };
  
  return NextResponse.json(response);
};