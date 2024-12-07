export interface Structure {
  id: string;
  type: 'biolab';
  level: number;
  substructures: {
    id: string;
    type: 'greenhouse';
    level: number;
  }[];
}

export interface Planet {
  id: string;
  name: string;
  starName: string;
  temperature: number;
  humidity: number;
  atmosphere: number;
}

export interface Plant {
  id: string;
  position: { x: number; y: number; z: number };
  name: string;
  species: string;
  image: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical';
  oxygenProduction: number;
  lastWatered: string;
  nextWateringDue: string;
  waterLevel: number;
}

export interface MapPosition {
  x: number;
  y: number;
  z: number;
}

export interface PlantMapData extends Plant {
  position: MapPosition;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  image: string;
  projectName: string;
  classification: string;
  lastObserved: string;
  status: 'healthy' | 'warning' | 'critical' | 'Unknown';
}

export interface Comment {
  id: string;
  text: string;
  user: string;
  timestamp: string;
};