"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import {
  type PlanetStats,
  determinePlanetType,
  determineTerrainType,
  TerrainType,
  getSoilTextureParams,
  calculateLandmarkInfluence,
  applyLandmarkEffect,
} from "@/lib/planet-physics";
import { getBiomeColors, modifyColorForSoilType } from "@/lib/biome-data";
import { generateHeightMap } from "./planet-utils";

interface PlanetSurfaceProps {
  planetStats: PlanetStats
}

export const PlanetSurface = forwardRef<THREE.Mesh, PlanetSurfaceProps>(function PlanetSurface({ planetStats }, ref) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)

  // Get biome colors
  const biomeColors = useMemo(() => {
    const colors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands")

    if (planetStats.soilType && planetType === "terrestrial") {
      return {
        oceanFloor: modifyColorForSoilType(colors.oceanFloor || "#5D4037", planetStats.soilType),
        beach: modifyColorForSoilType(colors.beach || "#8D6E63", planetStats.soilType),
        regular: modifyColorForSoilType(colors.regular || "#A1887F", planetStats.soilType),
        mountain: modifyColorForSoilType(colors.mountain || "#D7CCC8", planetStats.soilType),
      }
    }
    return colors
  }, [planetStats.biome, planetStats.customColors, planetStats.soilType, planetType])

  // Generate height map
  const heightMap = useMemo(() => generateHeightMap(planetStats, planetType), [planetStats, planetType])

  // Generate surface mesh
  const { surfaceGeometry, surfaceMaterial } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(planetStats.radius, 11)
    const positionAttribute = geometry.getAttribute("position")
    const vertices = [],
      colors = [],
      uvs = []
    const textureParams = getSoilTextureParams(planetStats.soilTexture || "rough")

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i),
        y = positionAttribute.getY(i),
        z = positionAttribute.getZ(i)
      const vertex = new THREE.Vector3(x, y, z)
      const normalizedPos = vertex.clone().normalize()

      // Get height and generate UVs
      let heightValue = heightMap.getHeight(normalizedPos)
      const u = 0.5 + Math.atan2(normalizedPos.z, normalizedPos.x) / (2 * Math.PI)
      const v = 0.5 - Math.asin(normalizedPos.y) / Math.PI
      uvs.push(u, v)

      // Apply landmark influences on the height value
      if (planetStats.landmarks && planetStats.landmarks.length > 0) {
        planetStats.landmarks.forEach((landmark) => {
          const influence = calculateLandmarkInfluence(normalizedPos, landmark, planetStats.radius)
          if (influence > 0) {
            heightValue = applyLandmarkEffect(heightValue, influence, landmark.influence_type || "mountain")
          }
        })
      }

      // Apply height to vertex
      const distortionAmount = planetType === "terrestrial" ? 0.08 : 0.05
      const roughnessMultiplier = planetStats.surfaceRoughness || 0.5
      const heightOffset = heightValue * distortionAmount * roughnessMultiplier * 1.5

      // Add soil texture details
      let textureDetail = 0
      if (planetType === "terrestrial" && heightOffset > 0.05) {
        const { scale, depth, pattern } = textureParams

        // Generate texture based on pattern type
        switch (pattern) {
          case "cracks":
            textureDetail = generateCrackTexture(normalizedPos, scale, depth)
            break
          case "layers":
            textureDetail = generateLayerTexture(normalizedPos, scale, depth)
            break
          case "crystals":
            textureDetail = generateCrystalTexture(normalizedPos, scale, depth)
            break
          case "pores":
            textureDetail = generatePoreTexture(normalizedPos, scale, depth)
            break
          case "grains":
            textureDetail = generateGrainTexture(normalizedPos, scale, depth)
            break
          default:
            textureDetail = generateDefaultTexture(normalizedPos, scale, depth, textureParams.irregularity)
        }

        // Apply soil type variation
        if (planetStats.soilType === "volcanic") textureDetail *= 1.5
        else if (planetStats.soilType === "sandy") textureDetail *= 0.7
      }

      vertex.add(normalizedPos.clone().multiplyScalar(heightOffset - textureDetail))
      vertices.push(vertex)

      // Determine terrain type and color
      const waterLevel = planetStats.waterLevel || 0
      const terrainType = determineTerrainType(heightOffset, waterLevel)
      const color = getTerrainColor(terrainType, biomeColors, planetStats, normalizedPos, textureParams)
      colors.push(color)
    }

    // Update geometry
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = vertices[i]
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    positionAttribute.needsUpdate = true
    geometry.computeVertexNormals()

    // Add colors and UVs to geometry
    const colorAttribute = new THREE.Float32BufferAttribute(new Float32Array(positionAttribute.count * 3), 3)
    for (let i = 0; i < colors.length; i++) {
      colorAttribute.setXYZ(i, colors[i].r, colors[i].g, colors[i].b)
    }
    geometry.setAttribute("color", colorAttribute)
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(uvs), 2))

    // Create material
    let material
    if (planetType === "terrestrial") {
      material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: false,
      })
    } else {
      material = createGasGiantMaterial(planetStats)
    }

    return { surfaceGeometry: geometry, surfaceMaterial: material }
  }, [planetStats, planetType, biomeColors, heightMap])

  return <mesh ref={ref} geometry={surfaceGeometry} material={surfaceMaterial} />
})

// Texture generation functions
function generateCrackTexture(normalizedPos: THREE.Vector3, scale: number, depth: number): number {
  const crackNoise1 = noise(normalizedPos.x * scale * 2, normalizedPos.y * scale * 2, normalizedPos.z * scale * 2)
  const crackNoise2 = noise(normalizedPos.x * scale * 5, normalizedPos.y * scale * 5, normalizedPos.z * scale * 5)
  return (Math.abs(crackNoise1) < 0.1 ? depth * 1.5 : 0) + (Math.abs(crackNoise2) < 0.05 ? depth * 0.8 : 0)
}

function generateLayerTexture(normalizedPos: THREE.Vector3, scale: number, depth: number): number {
  const layerNoise = noise(normalizedPos.x * scale * 0.5, normalizedPos.y * scale * 0.5, normalizedPos.z * scale * 0.5)
  return Math.sin(layerNoise * 20) * depth * 0.8
}

function generateCrystalTexture(normalizedPos: THREE.Vector3, scale: number, depth: number): number {
  const crystalNoise = noise(normalizedPos.x * scale * 3, normalizedPos.y * scale * 3, normalizedPos.z * scale * 3)
  return crystalNoise > 0.7 || crystalNoise < -0.7 ? depth * 1.2 : 0
}

function generatePoreTexture(normalizedPos: THREE.Vector3, scale: number, depth: number): number {
  const poreNoise = noise(normalizedPos.x * scale * 4, normalizedPos.y * scale * 4, normalizedPos.z * scale * 4)
  return poreNoise > 0.8 ? depth * 1.5 : 0
}

function generateGrainTexture(normalizedPos: THREE.Vector3, scale: number, depth: number): number {
  const grainNoise1 = noise(normalizedPos.x * scale * 8, normalizedPos.y * scale * 8, normalizedPos.z * scale * 8)
  const grainNoise2 = noise(normalizedPos.x * scale * 12, normalizedPos.y * scale * 12, normalizedPos.z * scale * 12)
  return grainNoise1 * grainNoise2 * depth
}

function generateDefaultTexture(
  normalizedPos: THREE.Vector3,
  scale: number,
  depth: number,
  irregularity: number,
): number {
  const defaultNoise = noise(normalizedPos.x * scale, normalizedPos.y * scale, normalizedPos.z * scale)
  return defaultNoise * depth * irregularity
}

function getTerrainColor(
  terrainType: TerrainType,
  biomeColors: any,
  planetStats: PlanetStats,
  normalizedPos: THREE.Vector3,
  textureParams: any,
): THREE.Color {
  // Get base color for terrain type
  const baseColorMap = {
    [TerrainType.OceanFloor]: biomeColors.oceanFloor,
    [TerrainType.Beach]: biomeColors.beach,
    [TerrainType.Regular]: biomeColors.regular,
    [TerrainType.Mountain]: biomeColors.mountain,
  }
  const baseColor = new THREE.Color(baseColorMap[terrainType] || biomeColors.regular)

  // Apply soil color and variations
  let finalColor = baseColor
  if (planetStats.soilType) {
    const soilColors = {
      rocky: new THREE.Color(0xb39980),
      sandy: new THREE.Color(0xd2b48c),
      volcanic: new THREE.Color(0x3a3a3a),
      organic: new THREE.Color(0x4d8c57),
      dusty: new THREE.Color(0xa0522d),
      frozen: new THREE.Color(0xe0ffff),
      muddy: new THREE.Color(0x614126),
    }
    const soilColor = soilColors[planetStats.soilType] || soilColors.rocky

    // Blend soil color with terrain color
    const blendRatios = {
      [TerrainType.OceanFloor]: 0.3,
      [TerrainType.Beach]: 0.6,
      [TerrainType.Regular]: 0.7,
      [TerrainType.Mountain]: 0.8,
    }
    finalColor = baseColor.clone().lerp(soilColor, blendRatios[terrainType] || 0.5)

    // Add micro-variation to mountain peaks
    if (terrainType === TerrainType.Mountain) {
      const microNoise = noise(normalizedPos.x * 50, normalizedPos.y * 50, normalizedPos.z * 50) * 0.1
      if (microNoise < 0) finalColor.multiplyScalar(0.9)
      else finalColor.multiplyScalar(1.1)

      // Add texture-specific color variations
      if (planetStats.soilTexture) {
        const textureNoise = noise(
          normalizedPos.x * textureParams.scale * 2,
          normalizedPos.y * textureParams.scale * 2,
          normalizedPos.z * textureParams.scale * 2,
        )

        if (planetStats.soilTexture === "crystalline" && textureNoise > 0.7) {
          finalColor.offsetHSL(0, 0, 0.1)
        } else if (planetStats.soilTexture === "cracked" && Math.abs(textureNoise) < 0.05) {
          finalColor.multiplyScalar(0.8)
        } else if (planetStats.soilTexture === "layered") {
          const layerValue = Math.sin(textureNoise * 20)
          if (layerValue > 0.8) finalColor.offsetHSL(0, 0, 0.05)
        }
      }
    }
  }

  // Add slight random variation
  const variation = (Math.random() - 0.5) * 0.1
  finalColor.r = Math.max(0, Math.min(1, finalColor.r + variation))
  finalColor.g = Math.max(0, Math.min(1, finalColor.g + variation))
  finalColor.b = Math.max(0, Math.min(1, finalColor.b + variation))

  return finalColor
}

function createGasGiantMaterial(planetStats: PlanetStats): THREE.ShaderMaterial {
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
  const fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float roughness;
    varying vec2 vUv;
    varying vec3 vNormal;
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    void main() {
      float bands = sin(vUv.y * 20.0) * 0.5 + 0.5;
      vec3 color = mix(color1, color2, bands);
      color = mix(color, color3, smoothstep(0.4, 0.6, abs(vNormal.y)));
      float noiseValue = noise(vUv * roughness * 10.0);
      color = mix(color, vec3(noiseValue), roughness * 0.2);
      gl_FragColor = vec4(color, 1.0);
    }
  `

  // Determine colors based on temperature
  let color1, color2, color3
  if (planetStats.temperature < 100) {
    color1 = new THREE.Color(0x4682b4)
    color2 = new THREE.Color(0x1e90ff)
    color3 = new THREE.Color(0x00bfff)
  } else if (planetStats.temperature > 300) {
    color1 = new THREE.Color(0xcd5c5c)
    color2 = new THREE.Color(0xf08080)
    color3 = new THREE.Color(0xfa8072)
  } else {
    color1 = new THREE.Color(0x9acd32)
    color2 = new THREE.Color(0x6b8e23)
    color3 = new THREE.Color(0x556b2f)
  }

  return new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: color1 },
      color2: { value: color2 },
      color3: { value: color3 },
      roughness: { value: planetStats.surfaceRoughness || 0.5 },
    },
    vertexShader,
    fragmentShader,
  })
}

// Import noise function from lib/noise.ts
import { noise } from "@/lib/noise";