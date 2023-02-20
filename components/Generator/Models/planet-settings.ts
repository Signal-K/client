import { Vector2, Vector3 } from 'three';

export interface PlanetSettings {
    name: string;
    seed: string;
    radius: number; // Size of the planet generated is based on an int/number value defined by the user
    color: string;
    terrainLayers: PlanetLayer[]; // Will be made up of PlanetLayer classes
}

export interface PlanetLayer { // Each layer has these parcreateMountainNoiseameters
    id?: string; // Can be set by tic ID -> multiple layers from different sectors?
    name: string;
    enabled: boolean;
    maskType: MaskTypes; // Then wrap the image mask around it
    noiseSettings?: NoiseSettings;
}

export interface NoiseSettings {
    baseRoughness: number;
    roughness: number;
    persistence: number;
    octaves: number; // 1+
    offset: Vector3;
    minValue: number;
    strength: number;
    stretch: Vector2; // 1+
    skew: Vector3; // 0-1
}

export enum MaskTypes {
    None = 'None',
    FirstLayer = 'First Layer',
    PrevLayer = 'Previous Layer',
}

export function createContintentNoise() {
    return {
        baseRoughness: 1.5,
        roughness: 2.5,
        persistence: 0.3,
        octaves: 3,
        offset: new Vector3(0, 0, 0),
        minValue: -0.05,
        strength: 0.3,
        stretch: new Vector2(0.7, 0.7),
        skew: new Vector3(0, 0, 0)
    } as NoiseSettings;
};

export function createMountainNoise() {
    return {
        baseRoughness: 1.5,
        roughness: 2.7,
        persistence: 0.35,
        octaves: 6,
        offset: new Vector3(0, 0, 0),
        minValue: -0.05,
        strength: 0.5,
        stretch: new Vector2(1, 1),
        skew: new Vector3(0, 0, 0),
    } as NoiseSettings;
};