// import { CapacityLevel } from "@/components/Structures/Auto/ActiveAutomaton";

interface Recipe {
    [key: string]: number;
};

export interface MineralDeposit {
  id: number;
  anomaly: number | null;
  owner: string | null;
  mineralconfiguration: {
    mineral: string;
    quantity: number;
  };
}; 

type SpeedLevel = 1 | 2 | 3;

export interface UserStructure {
    id: number;
    item: number; // Assuming this should be a number
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

interface Automaton {
    gif: null;
    id: number;
    item: number;
    owner: string;
    quantity: number;
    time_of_deploy: string | null;
    anomaly: number;
    configuration: {
      Power: number;
      Speed: SpeedLevel; 
      Capacity: Number;
    };
};  

export interface InventoryItem {
    item: number;
    owner: string;
    anomaly: number;
    id: number;
    name: string;
    quantity?: number;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    locationType?: string;
    itemLevel: number;
    gif?: string;
    recipe?: Recipe;
};

export interface InventoryStructureItem {
    configuration: {};
    itemDetail: any;
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string | null;
    time_of_deploy: string | null;
    anomaly: number | null;
    parentItem: number | null;
    locationType: string | null;
};

export interface TerrariumInventoryStructureItem {
    configuration: {};
    itemDetail: any;
    id: number;
    item: number;
    owner: string;
    quantity: number;
    notes: string | null;
    time_of_deploy: string | null;
    // anomaly: number | null;
    terrarium: number;
    parentItem: number | null;
    locationType: string | null;
};

export interface StructureItemDetail {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    locationType: string | null;
    parentItem: number | null;
    itemLevel: number;
    recipe?: Record<string, number>;
};

interface TerrariumStructureItemDetail {
    id: number;
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    locationType: string | null;
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