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
  { id: 12, name: 'Telescope Signal Receiver', description: 'This tool is used to receive transmissions from your transiting telescope and decode them into readable data. It is also the first component of your main telescope array', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/Telescope2.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '13': 3, '15': 2 }, locationType: 'Surface' }, // Originally pointed towards 2 alloy
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '/assets/Items/Silicon.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 14, name: 'Transiting Telescope', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 2, '15': 1 } },
  { id: 15, name: 'Iron', description: 'Test', cost: 1, icon_url: '/assets/Items/Iron.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '/assets/Items/Nickel.png', cost: 1, icon_url: '/assets/Items/Nickel.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '/assets/Items/Alloy.png', cost: 1, icon_url: '/assets/Items/Alloy.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '/assets/Items/Copper.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '/assets/Items/Chromite.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water', description: '/assets/Items/Ice.png', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 22, name: 'Vehicle Structure', description: '', cost: 1, icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4grkW7K-6nnJ7JtMVPDM58odIgUG7IEZnd65IqUrV4P9QcgT35SIiz_twqcblIXtfxCA&usqp=CAU', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '17': 4, '18': 2 } },
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://static-00.iconduck.com/assets.00/mars-rover-illustration-2048x2048-czfy73zy.png', ItemCategory: 'Automaton', parentItem: 22, itemLevel: 1, gif: "/assets/Items/Roover.gif", },  // https://cdn.dribbble.com/users/107759/screenshots/4248752/rover.gif
  { id: 24, name: 'Surveyor', description: 'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly.', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_eTRkeYatYQRQRwrjjAgYA2Pq?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9lVFJrZVlhdFlRUlFSd3JqakFnWUEyUHE~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=G5z~cUSlmAT2IT-qEQuZVOxQsRe-Q1le4erU8YfKnKe0hfsIq4fjmWArcgikYZLDKY8N0~kgPjf0hPQuHyxpYcDWlhmh1u7esBHffDf~5bR0tqjFcChfY6d1q-OCVvwkPxU9CMOOlxmwDYK3U6049ROnSXXZvmWDM7igl~CPaqILXt0bsNEtL4KWTDAfuBkfq7vDt1Jvy0h0k3z8dQ3XKdsFenqeQozdTp6B-y-7vxEbKcUMOqhEnOW0IXg1Z6egwHBD2dUD2fQhk-jAlQ7CbWeFQ~~h~emfyuFRYT7VMkiv2GICV12SENk2KkBnsB1t3kBONrJiUKlr~ekpsilerw__', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 1, } },
  { id: 25, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 29, name: "Starter Spaceship", description: 'You bravely piloted this spaceship down to your new home', cost: 0, icon_url: '', ItemCategory: 'Vehicles', parentItem: null, itemLevel: 1},
  { id: 30, name: 'Mining station', description: 'Used for mass-mining of resources; requires finding a mineral deposit', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/1504/1504044.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
  { id: 31, name: 'Automaton Upgrade Station', description: 'Add modules to your automatons!', cost: 1, icon_url: '/assets/items/camerars.png', ItemCategory: 'Structure', parentItem: 22, itemLevel: 1, recipe: { '11': 1 } },
  { id: 28, name: 'Camera Module', description: 'Your automatons can now take photos!', cost: 1, icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIO24cgji4a0syb8AtE9A7cSEWBqCfVU89F5OJ9kcB4-WWVs68-sw-uyJg4vmNuzKTHE8&usqp=CAU', ItemCategory: 'AutomatonModule', parentItem: 23, itemLevel: 1, recipe: { '11': 1} },
  { id: 26, name: 'Meteorology Tool', description: 'Collect cloud info', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/2826/2826342.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1} }, // Could be updated to be linked to 12?
  { id: 32, name: 'Camera Receiver', description: 'Keep track of all the photos your anomalies have taken', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/5169/5169909.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 }, locationType: 'Orbit' },
  { id: 33, name: 'Launchpad', description: 'You can now refuel and launch spacecraft from here!', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '15': 1 } }, // Update to be called "VehicleStructure"
  { id: 101, name: 'Telescope', description: 'gain an understanding of the overall behaviour and makeup of the planet you have selected', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1},
  { id: 102, name: 'Zoodex', description: 'populate your planet with some animals to gain an understanding of animal behaviour on your planet and aide local research back home', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1},
  { id: 103, name: 'Discovery Module', description: 'populate your planet with low-level content e.g. mining deposits, weather cycle behaviour etc (need to word this better)', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1},
  { id: 104, name: 'Camera Receiver Station', description: 'Keep track of all the photos your anomalies have taken (WIP)', cost: 1, icon_url: 'https://cdn-icons-png.flaticon.com/512/5169/5169909.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
  {
    id: 3101, name: 'Mining station', description: 'Gives you the ability to mine and view your mineral deposits', cost: 1, icon_url: '/assets/items/MiningStructure.png', ItemCategory: 'Structure', parentItem: 30, itemLevel: 1, locationType: 'Surface'
  },
  {
    id: 3102, name: 'Automaton station', description: 'View, control and upgrade all your automatons and rovers here', cost: 1, icon_url: '/assets/items/AutomatonController.png', ItemCategory: 'Structure', parentItem: 30, itemLevel: 1, locationType: 'Surface'
  },
  {
    id: 3103, name: 'Telescope', description: 'Space-based observations & classifications', icon_url: '/assets/Items/TransitingTelescope.png', ItemCategory: 'Structure', locationType: 'Orbital'
  },
  {
    id: 3104, name: "Zoodex", description: "Populate your planet with some animals to gain an understanding of animal behaviour on your planet and aide local research back home", cost: 1, icon_url: "/assets/items/Zoodex.png", ItemCategory: "Structure", parentItem: null, itemLevel: 1, locationType: "Surface"
  },
  {
    id: 3105,
    name: "LIDAR",
    // description: 'This tool is used to scan the surface of your planet and create a 3D model of the terrain', -- This is cool, but not what we're using lidar for yet (thanks copilot)
    description: "Collect and study weather events and entities",
    icon_url: "/assets/items/Lidar.png",
    ItemCategory: "Structure",
    locationType: 'Surface',
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
};