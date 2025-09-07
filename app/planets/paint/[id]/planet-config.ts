export type PlanetConfig = {
  type: string;
  seed: number;
  radius: number;
  temperature: number;
  biomass: number;
  mass: number;
  terrainRoughness: number;
  liquidHeight: number;
  volcanicActivity: number;
  continentSize: number;
  continentCount: number;
  noiseScale: number;
  debugMode: boolean;
  visibleTerrains: {
    ocean: boolean;
    beach: boolean;
    lowland: boolean;
    midland: boolean;
    highland: boolean;
    mountain: boolean;
    snow: boolean;
  };
  colors: {
    atmosphere: string;
    ocean: string;
    oceanPattern: string;
    beach: string;
    lowland: string;
    midland: string;
    highland: string;
    mountain: string;
    snow: string;
  };
};

export const defaultPlanetConfig: PlanetConfig = {
 "type": "terrestrial",
  "seed": 9123,
  "radius": 1.2,
  "temperature": 267,
  "biomass": 0.96,
  "mass": 2,
  "terrainRoughness": 0.6,
  "liquidHeight": 0.55,
  "volcanicActivity": 0.2,
  "continentSize": 0.5,
  "continentCount": 5,
  "noiseScale": 1,
  "debugMode": true,
  "visibleTerrains": {
    "ocean": false,
    "beach": false,
    "lowland": false,
    "midland": false,
    "highland": false,
    "mountain": false,
    "snow": false
  },
  "colors": {
    "atmosphere": "#30373a",
    "ocean": "#1E90FF",
    "oceanPattern": "#1E7FFF",
    "beach": "#F0E68C",
    "lowland": "#228B22",
    "midland": "#006400",
    "highland": "#8B4513",
    "mountain": "#A0A0A0",
    "snow": "#FFFFFF"
  }
};
