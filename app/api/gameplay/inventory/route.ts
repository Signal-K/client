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
  { id: 11, name: 'Coal', description: 'You can burn this to create power', cost: 1, icon_url: '/assets/Items/Coal.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1 },
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '/assets/Items/Silicon.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 15, name: 'Iron', description: 'Test', cost: 1, icon_url: '/assets/Items/Iron.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '/assets/Items/Nickel.png', cost: 1, icon_url: '/assets/Items/Nickel.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '/assets/Items/Alloy.png', cost: 1, icon_url: '/assets/Items/Alloy.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '/assets/Items/Copper.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '/assets/Items/Chromite.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water-Ice', description: '/assets/Items/Ice.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://static-00.iconduck.com/assets.00/mars-rover-illustration-2048x2048-czfy73zy.png', ItemCategory: 'Automaton', parentItem: 22, itemLevel: 1, gif: "/assets/Items/Roover.gif", },  // https://cdn.dribbble.com/users/107759/screenshots/4248752/rover.gif
  { id: 25, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 32, name: 'Camera Receiver', description: 'Keep track of all the photos your anomalies have taken', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/5169/5169909.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 }, locationType: 'Orbit' },

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