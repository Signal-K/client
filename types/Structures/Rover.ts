import type { ReactNode } from "react";

export interface BaseAnomaly {
    id: string;
    name: string;
    type: "rock_formation" | "dust_storm" | "mineral_deposit" | "geological_feature" | "atmospheric_event";
    project: string;
    classified?: boolean;
    discoveryDate?: string;
};

export interface SurfaceAnomaly extends BaseAnomaly {
    x: number;
    y: number;
    intensity: number;
    size: number;
    color: string;
    region: string;
    shape: "circle" | "irregular" | "linear" | "cluster" | "oval" | "angular";
    animationSpeed: number;
    opacity: number;
    planet: string;
    rover: string;
};

export interface RoverProject {
  id: string;
  name: string;
  description: string;
  anomalyType: "rock_formation" | "dust_storm" | "mineral_deposit" | "geological_feature" | "atmospheric_event";
  completed: number;
  total: number;
  icon: ReactNode;
  color: string;
  bgGradient: string;
};

export interface RoverMission {
  id: string;
  title: string;
  description: string;
  project: string;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  completed: boolean;
  icon: ReactNode;
};

export interface Rover {
  id: string;
  name: string;
  planet: string;
  x: number;
  y: number;
  batteryLevel: number;
  status: "active" | "standby" | "maintenance" | "offline";
  temperature: string;
  signalStrength: number;
  anomalyCount: number;
  description: string;
  missionDuration: string;
  distanceTraveled: string;
};

export interface Planet {
  id: string;
  name: string;
  surfaceColor: string;
  atmosphereColor: string;
  temperature: string;
  atmosphere: string;
  gravity: string;
  description: string;
};

export interface SurfaceLayer {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  driftSpeed: number;
  type: "dust" | "rock" | "sand" | "crater";
};

export type ViewMode = "rovers" | "surface" | "discoveries";

export type DiscoveryPanelPosition = "top" | "bottom" | "hidden";