export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Feature {
  id: string;
  type: 'fan' | 'blotch';
  position: Coordinate;
  orientation?: number; // degrees for fans
  size: number;
  season: string;
  intensity: number; // 0-1 for feature visibility
}

export interface SpiderFeature {
  position: Coordinate;
  size: number;
  branches: number;
}

export interface MapData {
  features: Feature[];
  spiders: SpiderFeature[];
  season: string;
  solarLongitude: number; // Ls value
  region: string;
}

export interface WindVector {
  position: Coordinate;
  direction: number;
  strength: number;
}

export type Season = 'spring' | 'summer';

export interface LayerState {
  fans: boolean;
  blotches: boolean;
  windVectors: boolean;
  seasonalOverlay: boolean;
}

