export interface InventoryItem {
    owner: string;
    anomaly: number;
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    gif?: string;
};
  
interface InventoryContextType {
    inventoryItems: { [key: number]: InventoryItem };
};