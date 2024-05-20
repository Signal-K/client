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
];

export default (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json(inventoryItems);
};
