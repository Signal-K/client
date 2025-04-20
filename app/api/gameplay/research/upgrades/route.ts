import { NextRequest, NextResponse } from 'next/server';

export interface ItemUpgrade {
  id: number;
  name: string;
  description: string;
  cost?: number;
  icon_url: string;
  parentItem?: number | null;
  locationType?: string;
  gif?: string;
};

const itemUpgrades: ItemUpgrade[] = [
    { id: 1, name: 'Telescope', description: 'A basic telescope for observing celestial objects.', cost: 100, icon_url: '/assets/Items/Telescope.png', parentItem: null, locationType: 'Orbit' },
    { id: 2, name: 'Advanced Telescope', description: 'An advanced telescope with enhanced capabilities.', cost: 500, icon_url: '/assets/Items/AdvancedTelescope.png', parentItem: 1, locationType: 'Orbit' },
    { id: 3, name: 'Space Probe', description: 'A probe designed for deep space exploration.', cost: 1000, icon_url: '/assets/Items/SpaceProbe.png', parentItem: null, locationType: 'Orbit' },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(itemUpgrades);
};