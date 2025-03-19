"use client"

// Base layer noise function
export function generateNoise(width: number, height: number, scale: number): number[][] {
  const noise: number[][] = Array(width)
    .fill(0)
    .map(() => Array(height).fill(0))

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sampleX = x / scale
      const sampleY = y / scale

      let amplitude = 1
      let frequency = 1
      let noiseHeight = 0

      // Add multiple octaves of noise
      for (let i = 0; i < 4; i++) {
        const perlinValue = Math.sin(sampleX * frequency) * Math.cos(sampleY * frequency)
        noiseHeight += perlinValue * amplitude

        amplitude *= 0.5
        frequency *= 2
      }

      noise[x][y] = noiseHeight
    }
  }

  return noise
}

// Secondary layer - Simplex noise implementation
export function generateSimpleNoise(seed: number, persistence: number) {
  // Simple pseudo-random number generator with seed
  const random = (x: number, y: number, z: number) => {
    const dot = x * 12.9898 + y * 78.233 + z * 37.719
    const value = Math.sin(dot * seed) * 43758.5453
    return value - Math.floor(value)
  }

  // Simple 3D noise function
  return (x: number, y: number, z: number) => {
    // Get integer and fractional parts
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const zi = Math.floor(z)
    const xf = x - xi
    const yf = y - yi
    const zf = z - zi

    // Interpolate between grid points
    let value = 0
    for (let dx = 0; dx <= 1; dx++) {
      for (let dy = 0; dy <= 1; dy++) {
        for (let dz = 0; dz <= 1; dz++) {
          const weight = (1 - Math.abs(dx - xf)) * (1 - Math.abs(dy - yf)) * (1 - Math.abs(dz - zf))
          const sample = random(xi + dx, yi + dy, zi + dz)
          value += sample * weight
        }
      }
    }

    return value * 2 - 1 // Map to [-1, 1]
  }
}

// More complex Perlin noise implementation
export function generatePerlinNoise(seed: number, octaves: number, persistence: number, lacunarity: number) {
  const simpleNoise = generateSimpleNoise(seed, persistence)

  return (x: number, y: number, z: number) => {
    let total = 0
    let frequency = 1
    let amplitude = 1
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += simpleNoise(x * frequency, y * frequency, z * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= lacunarity
    }

    return total / maxValue
  }
}

// Add Math.seedrandom for deterministic random number generation
// This is a simplified version for the example
declare global {
  interface Math {
    seedrandom: (seed: string) => () => number
  }
}

// Simple implementation of seedrandom
Math.seedrandom = (seed: string) => {
  let state = 0
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) & 0xffffffff
  }

  // Return a function that generates random numbers based on the seed
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff
    return state / 0xffffffff
  };
};