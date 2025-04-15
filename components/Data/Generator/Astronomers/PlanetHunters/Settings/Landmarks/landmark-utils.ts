"use client";

import * as THREE from "three";
import type { Landmark } from "@/lib/planet-physics";
import { noise } from "@/lib/noise";

// Generate random coordinates for a landmark
export function generateRandomCoordinates(): { x: number; y: number; z: number } {
  const phi = Math.random() * Math.PI * 2
  const theta = Math.random() * Math.PI
  const x = Math.sin(theta) * Math.cos(phi)
  const y = Math.sin(theta) * Math.sin(phi)
  const z = Math.cos(theta)

  return {
    x: Number.parseFloat(x.toFixed(2)),
    y: Number.parseFloat(y.toFixed(2)),
    z: Number.parseFloat(z.toFixed(2)),
  };
};

// Generate a unique landmark ID
export function generateLandmarkId(): string {
  return `LM-${Math.floor(Math.random() * 900 + 100)}`
}

// Generate a unique event ID
export function generateEventId(): string {
  return `EV-${Math.floor(Math.random() * 900 + 100)}`
}

// Apply noise to a position with given parameters
export function applyNoise(position: THREE.Vector3, scale: number, strength: number, octaves = 1): number {
  let result = 0
  let amplitude = 1
  let frequency = 1
  const persistence = 0.5

  for (let i = 0; i < octaves; i++) {
    result +=
      noise(position.x * scale * frequency, position.y * scale * frequency, position.z * scale * frequency) * amplitude

    amplitude *= persistence
    frequency *= 2
  }

  return result * strength
}

// Create a color based on height and parameters
export function createColorFromHeight(
  height: number,
  baseColor: THREE.Color,
  options: {
    minHeight?: number
    maxHeight?: number
    lowColor?: THREE.Color
    highColor?: THREE.Color
  } = {},
): THREE.Color {
  const {
    minHeight = -0.5,
    maxHeight = 0.5,
    lowColor = new THREE.Color(0x333333),
    highColor = new THREE.Color(0xffffff),
  } = options

  // Normalize height to 0-1 range
  const normalizedHeight = Math.max(0, Math.min(1, (height - minHeight) / (maxHeight - minHeight)))

  // Create color based on height
  if (normalizedHeight < 0.3) {
    return baseColor.clone().lerp(lowColor, 1 - normalizedHeight / 0.3)
  } else if (normalizedHeight > 0.7) {
    return baseColor.clone().lerp(highColor, (normalizedHeight - 0.7) / 0.3)
  }

  return baseColor.clone()
}

// Create a material based on landmark type and parameters
export function createMaterialForLandmark(
  landmark: Landmark,
  isGasGiant: boolean,
  options: {
    roughness?: number
    metalness?: number
    emissive?: THREE.Color
    emissiveIntensity?: number
    transparent?: boolean
    opacity?: number
  } = {},
): THREE.Material {
  const {
    roughness = 0.7,
    metalness = 0.1,
    emissive = new THREE.Color(0x000000),
    emissiveIntensity = 0,
    transparent = false,
    opacity = 1.0,
  } = options

  // Create material with vertex colors
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness,
    metalness,
    flatShading: false,
    transparent,
    opacity,
  })

  // Add emissive properties if specified
  if (emissiveIntensity > 0) {
    material.emissive = emissive
    material.emissiveIntensity = emissiveIntensity
  }

  return material
};