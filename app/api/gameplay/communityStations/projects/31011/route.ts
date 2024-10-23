import { NextRequest, NextResponse } from 'next/server';

interface Project {
  id: string;
  name: string;
  identifier: string;
}

interface Mission {
  id: string;
  name: string;
  type: string;
  project: string;
  missionRouteId?: number;
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
      identifier: "zoodex-burrOwls",
    },
    {
      id: "2",
      name: "Iguanas from Above",
      identifier: "zoodex-iguanasFromAbove",
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

export async function GET(req: NextRequest) {
  return NextResponse.json(greenhouseStation);
};