export interface Animal {
  name: string;
  icon: string;
  biomassType: string;
  mass: number; // in kilos, approximate average
};

export interface Biome {
  name: string;
  color: string;
  accentColor: string;
  darkColor: string;
};

export interface Location {
  coordinates: string;
  depth?: string;
  altitude?: string;
};

export interface Station {
  id: string; // also points to `inventory.item`
  name: string;
  icon: string;
  icon_url?: string;
  description?: string;
  biome: Biome;
  animals: Animal[];
  built: boolean;
  location: Location;
};