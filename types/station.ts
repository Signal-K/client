export interface Animal {
  name: string;
  icon: string;
  biomassType: string;
  mass: number;
};

export interface Biome {
  name: string;
  color: string;
  accentColor: string;
  darkColor: string;
};

export interface Station {
  id: string;
  name: string;
  icon: string;
  icon_url?: string;
  description?: string;
  biome: Biome;
  animals: Animal[];
  built: boolean;
  // location: Location;
};