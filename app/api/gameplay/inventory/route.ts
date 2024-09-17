import { NextRequest, NextResponse } from 'next/server';

interface Recipe {
  [key: string]: number;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost?: number;
  icon_url: string;
  ItemCategory: string;
  parentItem?: number | null;
  itemLevel?: number;
  locationType?: string;
  recipe?: Recipe; 
  gif?: string;
};

// Mock inventory items data
const inventoryItems: InventoryItem[] = [
  {
    id: 3101, name: 'Mining station', description: 'Gives you the ability to mine and view your mineral deposits', cost: 1, icon_url: '/assets/items/MiningStructure.png', ItemCategory: 'Structure', parentItem: 30, itemLevel: 1, locationType: 'Surface'
  },
  {
    id: 3102, name: 'Automaton station', description: 'View, control and upgrade all your automatons and rovers here', cost: 1, icon_url: '/assets/items/AutoController.png', ItemCategory: 'Structure', parentItem: 30, itemLevel: 1, locationType: 'Surface'
  },
  {
    id: 3103, name: 'Telescope', description: 'Space-based observations & classifications', icon_url: '/assets/Items/Telescope.png', ItemCategory: 'Structure', locationType: 'Surface'
  },
  {
    id: 3104, name: "Zoodex", description: "Populate your planet with some animals to gain an understanding of animal behaviour on your planet and aide local research back home", cost: 1, icon_url: "/assets/items/Pokedex.png", ItemCategory: "Structure", parentItem: null, itemLevel: 1, locationType: "Surface"
  },
  {
    id: 3105,
    name: "LIDAR",
    // description: 'This tool is used to scan the surface of your planet and create a 3D model of the terrain', -- This is cool, but not what we're using lidar for yet (thanks copilot)
    description: "Collect and study weather events and entities",
    icon_url: "/assets/items/Scoper.png",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },
  {
    id: 3106, 
    name: "Research Station",
    description: "Unlock new technology and research",
    icon_url: "/assets/items/Research.png",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },
  
  // Tests
  {
    id: 10600,
    name: "Helicopter",
    // description:
    description: "Fly, I'm not sure yet",
    icon_url: "/assets/items/Helicopter.png",
    ItemCategory: "Structure",
    locationType: 'Atmosphere',
  },
  {
    id: 10601,
    name: "Camera receiver",
    // description:
    description: "Connect to rovers",
    icon_url: "/assets/items/CameraReceiver.png",
    ItemCategory: "Structure",
    locationType: 'Orbital',
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
};