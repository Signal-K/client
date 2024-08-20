interface Recipe {
    [key: string]: number;
};

export interface InventoryItem {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    recipe?: Recipe;
};

export interface InventoryStructureItem {
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string | null;
    time_of_deploy: string | null;
    anomaly: number | null;
    parentItem: number | null;
};

export interface StructureItemDetail {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    recipe?: Record<string, number>;
};

export interface OwnedItem {
    id: string;
    item: string;
    quantity: number;
    sector: string;
    anomaly: number;
};

export interface UserItem {
    id: number;
    item: number;
    owner: string;
    notes: string;
    quantity: number;
    anomaly: string;
};