// Simplex Noise implementation
// Based on Stefan Gustavson's implementation

// Permutation table
const perm = new Uint8Array(512)
const p = new Uint8Array(256)

// Initialize permutation tables
function initNoise() {
  for (let i = 0; i < 256; i++) {
    p[i] = Math.floor(Math.random() * 256)
  }

  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
  }
}

// Call once to initialize
initNoise()

// Fade function as defined by Ken Perlin
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// Linear interpolation
function lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b
}

// Convert low 4 bits of hash code into 12 gradient directions
function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

// 3D Simplex noise
export function noise(x: number, y: number, z: number): number {
  // Find unit grid cell containing point
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  const Z = Math.floor(z) & 255

  // Get relative xyz coordinates of point within cell
  x -= Math.floor(x)
  y -= Math.floor(y)
  z -= Math.floor(z)

  // Compute fade curves for each of x, y, z
  const u = fade(x)
  const v = fade(y)
  const w = fade(z)

  // Hash coordinates of the 8 cube corners
  const A = perm[X] + Y
  const AA = perm[A] + Z
  const AB = perm[A + 1] + Z
  const B = perm[X + 1] + Y
  const BA = perm[B] + Z
  const BB = perm[B + 1] + Z

  // Add blended results from 8 corners of cube
  return lerp(
    lerp(
      lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
      lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u),
      v,
    ),
    lerp(
      lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u),
      v,
    ),
    w,
  )
};