import { NextRequest, NextResponse } from 'next/server';

interface Recipe {
  [key: string]: number;
}

export interface InventoryItem {
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

const inventoryItems: InventoryItem[] = [

  // Items/Minerals
  { id: 11, name: 'Coal', description: 'You can burn this to create power', cost: 1, icon_url: '/assets/Items/Coal.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1 },
  { id: 12, name: 'Telescope Signal Receiver', description: 'This tool is used to receive transmissions from your transiting telescope and decode them into readable data. It is also the first component of your main telescope array', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/Telescope2.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '13': 3, '15': 2 }, }, // Originally pointed towards 2 alloy
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '/assets/Items/Silicon.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 14, name: 'Transiting Telescope', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 2, '15': 1 } },
  { id: 15, name: 'Iron', description: 'Test', cost: 1, icon_url: '/assets/Items/Iron.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '/assets/Items/Nickel.png', cost: 1, icon_url: '/assets/Items/Nickel.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '/assets/Items/Alloy.png', cost: 1, icon_url: '/assets/Items/Alloy.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '/assets/Items/Copper.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '/assets/Items/Chromite.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water-Ice', description: '/assets/Items/Ice.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 32, name: 'Camera Receiver', description: 'Keep track of all the photos your anomalies have taken', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/5169/5169909.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 }, locationType: 'Orbit' },
  
  // Automatons
  { 
    id: 23, 
    name: 'Rover 1', 
    description: '', 
    cost: 1, 
    icon_url: '/assets/Automatons/ExploreRover1.png',
    ItemCategory: 'Automaton', 
    // parentItem: 22, 
    itemLevel: 1, 
    gif: "/assets/Items/Roover.gif", },  // https://cdn.dribbble.com/users/107759/screenshots/4248752/rover.gif
  

  // Structures
  {
    id: 3102, name: 'Automaton station', description: 'View, control and upgrade all your automatons and rovers here', cost: 1, icon_url: '/assets/Items/AutoController.png', ItemCategory: 'Structure', parentItem: 30, itemLevel: 1, locationType: 'Surface'
  },
  {
    id: 3103, name: 'Telescope', description: 'Space-based observations & classifications', icon_url: '/assets/Items/Telescope.png', ItemCategory: 'Structure', locationType: 'Surface'
  }, 
  { // Previously referred to as #Zoodex-3104
    id: 3104, name: "Biodome", description: "Populate your planet with some animals to gain an understanding of animal behaviour on your planet and aide local research back home", cost: 1, icon_url: "/assets/Items/Pokedex.png", ItemCategory: "Structure", parentItem: null, itemLevel: 1, locationType: "Surface"
  },
  {
    id: 3105,
    name: "Weather Balloon", // "LIDAR",
    description: "Collect and study weather events and entities",
    icon_url: "/assets/Items/WeatherBalloon.png", //Scoper.png",
    ItemCategory: "Structure",
    locationType: 'Atmosphere',
  },
  {
    id: 3106, 
    name: "Research Station",
    description: "Unlock new technology and research",
    icon_url: "/assets/Items/Research.png",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },
  {
    id: 3107,
    name: "Launchpad",
    description: "Launch rockets and satellites",
    icon_url: "/assets/Items/Launchpad.jpg",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },
  {
    id: 3108,
    name: "First rocket",
    description: "Travel the solar-system",
    icon_url: "/assets/Items/Rocket.png",
    ItemCategory: "Structure",
    locationType: 'Atmosphere',
  },


  // Classification structures introduced in C2
  {
    id: 31010,
    name: "Physics Lab",
    description: "Catalogue results from different particle experiments across the universe",
    icon_url: "/assets/Items/PhysicsLab.png",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },

  // Community stations
  {
    id: 31011,
    name: "Greenhouse",
    description: "Collect and study biological anomalies across multiple locations",
    icon_url: "/assets/Items/Greenhouse.png",
    ItemCategory: 'CommunityStation',
    locationType: 'Surface',
  },
  {
    id: 31012,
    name: "Weather balloon",
    description: "Collect and study weather events and entities more closely in your planet's atmosphere",
    icon_url: "/assets/Items/WeatherBalloon.png",
    ItemCategory: 'CommunityStation',
    locationType: 'Atmosphere',
  },
  {
    id: 31013,
    name: "Space Telescope",
    description: "Collect & compare discoveries more readily per-location", // to-update
    icon_url: "/assets/Items/SpaceTelescope.png",
    ItemCategory: 'CommunityStation',
    locationType: 'Orbital',
  },


  // Greenhouse/Biodome stations
  {
    id: 3104001,
    name: "Desert Observatory",
    description: "Track & tag animals and plants that originate in desert locations on Earth",
    icon_url: '/assets/Archive/Inventory/Items/Coal.png', // For test
    ItemCategory: 'BioDomeStation',
    locationType: 'Surface',
  },
  {
    id: 3104002,
    name: "Ocean Observatory",
    description: "Track & tag animals and plants that originate in the oceans of Earth",
    icon_url: '/assets/Archive/Inventory/Items/Coal.png', // For test
    ItemCategory: 'BioDomeStation',
    locationType: 'Surface', // Maybe underwater?
  },

  
  // Tests
  {
    id: 10600,
    name: "Helicopter",
    // description:
    description: "Fly, I'm not sure yet",
    icon_url: "/assets/Items/Helicopter.png",
    ItemCategory: "Structure",
    locationType: 'Atmosphere',
  },
  {
    id: 10601,
    name: "Camera receiver",
    // description:
    description: "Connect to rovers",
    icon_url: "/assets/Items/CameraReceiver.png",
    ItemCategory: "Structure",
    locationType: 'Orbital',
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
};