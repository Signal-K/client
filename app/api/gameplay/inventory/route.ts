import { NextRequest, NextResponse } from 'next/server';

interface Recipe {
  [key: string]: number;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: Recipe;
}

// Mock inventory items data
const inventoryItems: InventoryItem[] = [
  { id: 11, name: 'Coal', description: 'You can burn this to create power', cost: 1, icon_url: 'https://raw.githubusercontent.com/Signal-K/client/initialClassification/public/assets/Inventory/Items/Coal.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1 },
  { id: 12, name: 'Telescope Signal Receiver', description: 'This tool is used to receive transmissions from your transiting telescope and decode them into readable data. It is also the first component of your main telescope array', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/Telescope2.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { Silicon: 3, Alloy: 2 } },
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 14, name: 'Transiting Telescope', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { Silicon: 2, Iron: 1 } },
  { id: 15, name: 'Iron', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 22, name: 'Vehicle Structure', description: '', cost: 1, icon_url: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/r2d2.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { Alloy: 4, Fuel: 2 } },
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Automaton', parentItem: 22, itemLevel: 1 }, 
  { id: 24, name: 'Surveyor', description: 'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly.', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { Silicon: 3, Nickel: 1 } },
  { id: 25, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
}
