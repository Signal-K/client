import * as THREE from "three";

export interface Landmark {
  classification_id: string
  type: string
  visual_effect: string
  image_link: string
  coordinates: {
    x: number
    y: number
    z: number
  }
  events?: LandmarkEvent[] // New field for replayable events
  structures?: LandmarkStructure[] // New field for 3D structures
  influence_type?:
    | "crater"
    | "mountain"
    | "valley"
    | "volcano"
    | "basin"
    | "dune"
    | "glacier"
    | "storm"
    | "vortex"
    | "band"
    | "spot"
    | "turbulent"
    | "cyclone"
    | "anticyclone"
    | "zonal_flow"
    | "canyon"
    | "ocean_ridge"
    | "trench"
    | "ice_patch"
    | "lava_flow"
  influence_radius?: number
  influence_strength?: number
  influence_roughness?: number
  category?: "terrestrial" | "gaseous" // New field to categorize landmarks
  isActive?: boolean
}

export interface LandmarkEvent {
  id: string
  type: string
  description: string
  duration?: number
  intensity?: number
  // Additional fields can be added for event configuration
}

// Add this interface after the LandmarkEvent interface
export interface LandmarkStructure {
  id: string
  type: string
  name: string
  description?: string
  scale: { x: number; y: number; z: number }
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  color: string
  emissive?: string
  emissiveIntensity?: number
  metalness?: number
  roughness?: number
  opacity?: number
  wireframe?: boolean
}

export interface PlanetStats {
  mass: number
  radius: number
  density?: number
  temperature: number
  surfaceRoughness?: number
  terrainErosion?: number
  waterLevel?: number
  biomassLevel?: number
  plateTectonics?: number
  soilType?: "rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy"
  soilTexture?: "smooth" | "rough" | "cracked" | "layered" | "porous" | "grainy" | "crystalline"
  atmosphereStrength?: number
  liquidType?: "water" | "methane" | "nitrogen" | "ammonia" | "ethane"
  salinity?: number
  precipitationCompound?: "none" | "water" | "co2" | "methane" | "snow"
  biome?: string
  mountainHeight?: number
  hasRings?: boolean
  cloudCount?: number
  volcanicActivity?: number
  waterHeight?: number
  liquidEnabled?: boolean
  landmarks?: Landmark[]
  customColors?: {
    oceanFloor?: string
    beach?: string
    regular?: string
    mountain?: string
  }
}

export const defaultPlanetStats: PlanetStats = {
  mass: 1,
  radius: 1,
  density: 5.51,
  temperature: 288,
  surfaceRoughness: 0.5,
  terrainErosion: 0.3,
  waterLevel: 0.65,
  biomassLevel: 0.2,
  plateTectonics: 0.8,
  soilType: "rocky",
  soilTexture: "rough",
  atmosphereStrength: 0.8,
  liquidType: "water",
  salinity: 0.35,
  precipitationCompound: "water",
  biome: "Rocky Highlands",
  mountainHeight: 0.6,
  hasRings: false,
  cloudCount: 30,
  volcanicActivity: 0.3,
  waterHeight: 0.65,
  liquidEnabled: true,
  landmarks: [
    {
      classification_id: "LM-001",
      type: "Mountain Peak",
      visual_effect: "None",
      image_link: "",
      coordinates: { x: 0.5, y: 0.8, z: 0.3 },
      events: [],
      influence_type: "mountain",
      influence_radius: 0.5,
      influence_strength: 0.7,
      influence_roughness: 0.5,
      category: "terrestrial", // Add category
    },
  ],
}

export function calculateDensity(mass: number, radius: number): number {
  return (mass / Math.pow(radius, 3)) * 5.51
}

export function determinePlanetType(mass: number, radius: number): "terrestrial" | "gaseous" {
  return mass > 7 || radius > 2.5 ? "gaseous" : "terrestrial"
}

export function determineLiquidType(temperature: number): {
  type: "water" | "methane" | "nitrogen" | "ammonia" | "ethane" | "none"
  color: string
} {
  if (temperature >= 273 && temperature <= 373) return { type: "water", color: "#1E4D6B" }
  if (temperature >= 91 && temperature <= 112) return { type: "methane", color: "#7FB3D5" }
  if (temperature >= 63 && temperature <= 77) return { type: "nitrogen", color: "#90EE90" }
  if (temperature >= 195 && temperature <= 240) return { type: "ammonia", color: "#D8BFD8" }
  if (temperature >= 90 && temperature <= 184) return { type: "ethane", color: "#FFD700" }
  return { type: "none", color: "#8B4513" }
}

export function isLiquidAvailable(temperature: number, liquidType: string): boolean {
  const ranges = {
    water: [273, 373],
    methane: [91, 112],
    nitrogen: [63, 77],
    ammonia: [195, 240],
    ethane: [90, 184],
  }
  const range = ranges[liquidType as keyof typeof ranges]
  return range ? temperature >= range[0] && temperature <= range[1] : false
}

export enum TerrainType {
  OceanFloor = 0,
  Beach = 1,
  Regular = 2,
  Mountain = 3,
}

export function getSoilTextureParams(texture: string): {
  scale: number
  depth: number
  irregularity: number
  pattern: "noise" | "cracks" | "layers" | "crystals" | "pores" | "grains"
} {
  const params: Record<string, { scale: number; depth: number; irregularity: number; pattern: "layers" | "noise" | "cracks" | "crystals" | "pores" | "grains" }> = {
    smooth: { scale: 5, depth: 0.01, irregularity: 0.1, pattern: "noise" },
    rough: { scale: 15, depth: 0.05, irregularity: 0.7, pattern: "noise" },
    cracked: { scale: 20, depth: 0.08, irregularity: 0.6, pattern: "cracks" },
    layered: { scale: 12, depth: 0.04, irregularity: 0.3, pattern: "layers" },
    porous: { scale: 25, depth: 0.06, irregularity: 0.5, pattern: "pores" },
    grainy: { scale: 30, depth: 0.03, irregularity: 0.8, pattern: "grains" },
    crystalline: { scale: 18, depth: 0.07, irregularity: 0.4, pattern: "crystals" },
  }
  return params[texture as keyof typeof params] || params.rough
}

export function determineTerrainType(height: number, waterLevel: number): TerrainType {
  const normalizedHeight = (height + 0.15) / 0.3
  if (normalizedHeight < waterLevel - 0.2) return TerrainType.OceanFloor
  if (normalizedHeight < waterLevel) return TerrainType.Beach
  if (normalizedHeight < waterLevel + 0.4) return TerrainType.Regular
  return TerrainType.Mountain
}

export function mergeWithDefaults(partialStats: Partial<PlanetStats>): PlanetStats {
  const mergedStats = { ...defaultPlanetStats, ...partialStats }
  if (partialStats.mass !== undefined || partialStats.radius !== undefined) {
    mergedStats.density = calculateDensity(mergedStats.mass, mergedStats.radius)
  }

  // Ensure at least one landmark exists
  if (!mergedStats.landmarks || mergedStats.landmarks.length === 0) {
    mergedStats.landmarks = generateDefaultLandmarks(mergedStats)
  }

  return mergedStats
}

// Update the generateDefaultLandmarks function to ensure it always creates both types of landmarks
export function generateDefaultLandmarks(planetStats: PlanetStats): Landmark[] {
  const landmarks: Landmark[] = []

  // Generate a random position on the sphere
  const getRandomPosition = () => {
    const phi = Math.random() * Math.PI * 2
    const theta = Math.random() * Math.PI
    const x = Math.sin(theta) * Math.cos(phi)
    const y = Math.sin(theta) * Math.sin(phi)
    const z = Math.cos(theta)
    return { x, y, z }
  }

  // Generate ID with format LM-XXX where XXX is a random 3-digit number
  const generateId = () => `LM-${Math.floor(Math.random() * 900 + 100)}`

  // Always add a terrestrial landmark
  const biome = planetStats.biome || "Rocky Highlands"
  let landmarkType = "Mountain Peak"
  let visualEffect = "None"
  let influenceType: Landmark["influence_type"] = "mountain"
  let influenceRadius = 0.5
  let influenceStrength = 0.7
  let influenceRoughness = 0.5

  // Determine landmark type based on biome
  if (biome.includes("Ocean")) {
    landmarkType = "Oceanic Trench"
    visualEffect = "Bioluminescence"
    influenceType = "valley"
    influenceRadius = 0.6
    influenceStrength = 0.5
    influenceRoughness = 0.2
  } else if (biome.includes("Volcanic")) {
    landmarkType = "Active Volcano"
    visualEffect = "Smoke Plume"
    influenceType = "volcano"
    influenceRadius = 0.4
    influenceStrength = 0.8
    influenceRoughness = 0.7
  } else if (biome.includes("Jungle") || biome.includes("Tropical")) {
    landmarkType = "Dense Vegetation"
    visualEffect = "Mist"
    influenceType = "mountain"
    influenceRadius = 0.5
    influenceStrength = 0.4
    influenceRoughness = 0.3
  } else if (biome.includes("Dune") || biome.includes("Desert") || biome.includes("Arid")) {
    landmarkType = "Sand Formation"
    visualEffect = "Dust Storm"
    influenceType = "dune"
    influenceRadius = 0.7
    influenceStrength = 0.5
    influenceRoughness = 0.2
  } else if (biome.includes("Frigid") || biome.includes("Tundra")) {
    landmarkType = "Ice Formation"
    visualEffect = "Aurora"
    influenceType = "glacier"
    influenceRadius = 0.6
    influenceStrength = 0.4
    influenceRoughness = 0.1
  }

  landmarks.push({
    classification_id: generateId(),
    type: landmarkType,
    visual_effect: visualEffect,
    image_link: "",
    coordinates: getRandomPosition(),
    events: [],
    influence_type: influenceType,
    influence_radius: influenceRadius,
    influence_strength: influenceStrength,
    influence_roughness: influenceRoughness,
    category: "terrestrial",
  })

  // Always add a gaseous landmark
  const stormTypes = ["Great Storm", "Cyclonic Formation", "Atmospheric Bands", "Vortex"]
  const visualEffects = ["Lightning", "Color Shift", "Turbulence"]
  const influenceTypes: Landmark["influence_type"][] = [
    "storm",
    "vortex",
    "band",
    "spot",
    "cyclone",
    "anticyclone",
    "zonal_flow",
  ]

  landmarks.push({
    classification_id: generateId(),
    type: stormTypes[Math.floor(Math.random() * stormTypes.length)],
    visual_effect: visualEffects[Math.floor(Math.random() * visualEffects.length)],
    image_link: "",
    coordinates: getRandomPosition(),
    events: [],
    influence_type: influenceTypes[Math.floor(Math.random() * influenceTypes.length)],
    influence_radius: 0.5 + Math.random() * 0.5,
    influence_strength: 0.4 + Math.random() * 0.4,
    influence_roughness: 0.6 + Math.random() * 0.3,
    category: "gaseous",
  })

  return landmarks
}

// Calculate the influence of a landmark at a specific position
export function calculateLandmarkInfluence(
  normalizedPos: THREE.Vector3,
  landmark: Landmark,
  planetRadius: number,
): number {
  if (!landmark.influence_radius || !landmark.influence_strength) return 0

  // Calculate distance from position to landmark
  const landmarkPos = new THREE.Vector3(
    landmark.coordinates.x,
    landmark.coordinates.y,
    landmark.coordinates.z,
  ).normalize()

  // Calculate angular distance (in radians)
  const dotProduct = normalizedPos.dot(landmarkPos)
  const angularDistance = Math.acos(Math.max(-1, Math.min(1, dotProduct)))

  // Convert to surface distance
  const surfaceDistance = angularDistance * planetRadius

  // Calculate influence based on distance
  const maxDistance = landmark.influence_radius * planetRadius
  if (surfaceDistance <= maxDistance) {
    // Linear falloff with distance
    return landmark.influence_strength * (1 - surfaceDistance / maxDistance)
  }

  return 0
}

// Apply landmark effect to height value
export function applyLandmarkEffect(
  baseHeight: number,
  influence: number,
  influenceType: Landmark["influence_type"],
): number {
  switch (influenceType) {
    case "crater":
      // Depression with raised rim
      return baseHeight - influence * 0.5

    case "mountain":
      // Raised area
      return baseHeight + influence * 0.8

    case "valley":
      // Linear depression
      return baseHeight - influence * 0.6

    case "volcano":
      // Conical elevation
      return baseHeight + influence * 0.9

    case "basin":
      // Wide depression
      return baseHeight - influence * 0.4

    case "dune":
      // Wavy pattern
      return baseHeight + influence * 0.5 * Math.sin(baseHeight * 10)

    case "glacier":
      // Smooth raised area
      return baseHeight + influence * 0.4

    case "storm":
    case "vortex":
    case "band":
    case "spot":
      // Gas giant features - subtle elevation changes
      return baseHeight + influence * 0.3

    default:
      return baseHeight
  }
}

export interface LandmarkTerrainInfluence {
  height: number
  roughness: number
}

// Calculate the terrain influence of landmarks at a given position
export function calculateLandmarkTerrainInfluence(
  position: THREE.Vector3,
  landmarks: Landmark[] | undefined,
  planetRadius: number,
): LandmarkTerrainInfluence {
  let totalHeightInfluence = 0
  let totalRoughnessInfluence = 0

  if (landmarks) {
    landmarks.forEach((landmark) => {
      if (!landmark.influence_radius || !landmark.influence_strength) return

      const landmarkPos = new THREE.Vector3(landmark.coordinates.x, landmark.coordinates.y, landmark.coordinates.z)
        .normalize()
        .multiplyScalar(planetRadius)

      const distance = position.distanceTo(landmarkPos)
      const maxDistance = landmark.influence_radius * planetRadius

      if (distance < maxDistance) {
        const normalizedDistance = distance / maxDistance
        const influenceFactor = landmark.influence_strength * (1 - normalizedDistance)

        // Apply different height effects based on influence type
        let heightInfluence = 0
        switch (landmark.influence_type) {
          case "crater":
            heightInfluence = -influenceFactor * 0.05 // Depression
            break
          case "mountain":
            heightInfluence = influenceFactor * 0.08 // Elevation
            break
          case "valley":
            heightInfluence = -influenceFactor * 0.03 // Slight depression
            break
          case "volcano":
            heightInfluence = influenceFactor * 0.1 // Cone-shaped elevation
            break
          case "basin":
            heightInfluence = -influenceFactor * 0.04 // Wide depression
            break
          case "dune":
            heightInfluence = influenceFactor * 0.02 * Math.sin(distance * 5) // Wavy surface
            break
          case "glacier":
            heightInfluence = influenceFactor * 0.06 // Smooth elevation
            break
          case "storm":
          case "vortex":
          case "band":
          case "spot":
            heightInfluence = influenceFactor * 0.03 // Subtle atmospheric effect
            break
          default:
            heightInfluence = influenceFactor * 0.05
        }

        // Apply roughness influence (example: volcanic areas are rougher)
        let roughnessInfluence = 0
        if (landmark.influence_type === "volcano") {
          roughnessInfluence = influenceFactor * 0.2
        }

        totalHeightInfluence += heightInfluence
        totalRoughnessInfluence += roughnessInfluence
      }
    })
  }

  return {
    height: totalHeightInfluence,
    roughness: totalRoughnessInfluence,
  }
};