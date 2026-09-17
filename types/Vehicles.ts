export interface VehicleStats {
    speed: number
    armor: number
    capacity: number
};
  
export interface Vehicle {
    id: string
    name: string
    description: string
    image: string;
    stats: VehicleStats
    cost: number
    quantity: number
};