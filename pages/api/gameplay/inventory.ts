import { NextApiRequest, NextApiResponse } from 'next';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
}

// Mock inventory items data
const inventoryItems: InventoryItem[] = [
  { id: 11, name: 'Coal', description: 'You can burn this to create power', cost: 1, icon_url: 'https://raw.githubusercontent.com/Signal-K/client/initialClassification/public/assets/Inventory/Items/Coal.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1 },
  { id: 12, name: 'Telescope Signal Receiver', description: 'This tool is used to receive transmissions from your transiting telescope and decode them into readable data. It is also the first component of your main telescope array', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/Telescope2.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1 },
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 14, name: 'Transiting Telescope', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1},
  { id: 15, name: 'Iron', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 22, name: 'Vehicle Structure', description: '', cost: 1, icon_url: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/r2d2.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1},
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Automaton', parentItem: null, itemLevel: 1}, // https://cdn.cloud.scenario.com/assets/asset_eX92nBShzZbTFAVxomTZoVkt?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9lWDkybkJTaHpaYlRGQVZ4b21UWm9Wa3Q~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzE5OTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=tKuHQxf7gLWDQgnJ~0h6nOFJAn6f2wj3qkbOUd6EkhXYpCupDGYyoYQhCdPmSMURjmYsqpAuBs930Bb~rXMT8-dZFRqNENpDq4Vz7XY0lKjgNMa6laOcr8rOfV9fsT251WcvE~XYwlbxEbE0U4w1cOtgfXbR6gOOv66jjRSHYe-eIBaqkwLRJ0iqCSMTEkF-bjoXTlkFThl9kNRzXDYqIXc6FzveRW6NCHKEDS7e0UTiCZ2UQHF3Bk6-S64n81uB7fE8UHcw1W3Za-qhbuX734Zc1Q86JabZZJMQ8kWTOnXXT8fwh6B-VywwNynzRNrWrMFynySuq8u2Qsr0T~9qJA__
  { id: 24, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
]; 

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(inventoryItems);
};
