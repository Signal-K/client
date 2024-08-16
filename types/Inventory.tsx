interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
};
  
interface InventoryContextType {
    inventoryItems: { [key: number]: InventoryItem };
};