"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import {
  type PlanetStats,
  determinePlanetType,
  determineLiquidType,
  isLiquidAvailable,
  determineTerrainType,
  TerrainType,
  getSoilTextureParams,
} from "@/lib/planet-physics"
import { noise } from "@/lib/noise"
import { getBiomeColors, modifyColorForSoilType } from "@/lib/biome-data"

export function Planet({ planetStats }: { planetStats: PlanetStats }) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const liquidInfo = determineLiquidType(planetStats.temperature)
  const liquidAvailable = isLiquidAvailable(planetStats.temperature, planetStats.liquidType || liquidInfo.type)

  // References for rotation
  const refs = {
    surface: useRef<THREE.Mesh>(null),
    atmosphere: useRef<THREE.Mesh>(null),
    liquid: useRef<THREE.Mesh>(null),
    clouds: useRef<THREE.Group>(null),
  }

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
  const heightMap = useMemo(() => {
    const heightData = new Map<string, number>()
    const resolution = 12
    const geometry = new THREE.IcosahedronGeometry(1, resolution)
    const positions = geometry.getAttribute("position")

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        y = positions.getY(i),
        z = positions.getZ(i)
      const normalizedPos = new THREE.Vector3(x, y, z).normalize()
      let heightValue = 0

      if (planetType === "terrestrial") {
        const roughness = (planetStats.surfaceRoughness || 0.5) * 1.2
        let frequency = 1,
          amplitude = 1,
          persistence = 0.5

        for (let j = 0; j < 7; j++) {
          const n = noise(
            normalizedPos.x * frequency * roughness,
            normalizedPos.y * frequency * roughness,
            normalizedPos.z * frequency * roughness,
          )
          heightValue += n * amplitude
          amplitude *= persistence
          frequency *= 2
        }

        heightValue *= planetStats.mountainHeight || 0.5
        if (planetStats.terrainErosion) {
          heightValue *= 1 - planetStats.terrainErosion * 0.3
        }
      } else {
        const roughness = planetStats.surfaceRoughness || 0.5
        heightValue =
          noise(normalizedPos.x * 2 * roughness, normalizedPos.y * 2 * roughness, normalizedPos.z * 2 * roughness) * 0.1
      }

      const key = `${normalizedPos.x.toFixed(5)},${normalizedPos.y.toFixed(5)},${normalizedPos.z.toFixed(5)}`
      heightData.set(key, heightValue)
    }

    return {
      getHeight: (normalizedPos: THREE.Vector3): number => {
        const key = `${normalizedPos.x.toFixed(5)},${normalizedPos.y.toFixed(5)},${normalizedPos.z.toFixed(5)}`
        const exactMatch = heightData.get(key)
        if (exactMatch !== undefined) return exactMatch

        let closestDist = Number.POSITIVE_INFINITY,
          closestHeight = 0
        heightData.forEach((height, keyStr) => {
          const [x, y, z] = keyStr.split(",").map(Number.parseFloat)
          const pos = new THREE.Vector3(x, y, z)
          const dist = normalizedPos.distanceTo(pos)
          if (dist < closestDist) {
            closestDist = dist
            closestHeight = height
          }
        })
        return closestHeight
      },
    }
  }, [planetStats.surfaceRoughness, planetStats.mountainHeight, planetStats.terrainErosion, planetType])

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
      const heightValue = heightMap.getHeight(normalizedPos)
      const u = 0.5 + Math.atan2(normalizedPos.z, normalizedPos.x) / (2 * Math.PI)
      const v = 0.5 - Math.asin(normalizedPos.y) / Math.PI
      uvs.push(u, v)

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
            const crackNoise1 = noise(
              normalizedPos.x * scale * 2,
              normalizedPos.y * scale * 2,
              normalizedPos.z * scale * 2,
            )
            const crackNoise2 = noise(
              normalizedPos.x * scale * 5,
              normalizedPos.y * scale * 5,
              normalizedPos.z * scale * 5,
            )
            textureDetail =
              (Math.abs(crackNoise1) < 0.1 ? depth * 1.5 : 0) + (Math.abs(crackNoise2) < 0.05 ? depth * 0.8 : 0)
            break
          case "layers":
            const layerNoise = noise(
              normalizedPos.x * scale * 0.5,
              normalizedPos.y * scale * 0.5,
              normalizedPos.z * scale * 0.5,
            )
            textureDetail = Math.sin(layerNoise * 20) * depth * 0.8
            break
          case "crystals":
            const crystalNoise = noise(
              normalizedPos.x * scale * 3,
              normalizedPos.y * scale * 3,
              normalizedPos.z * scale * 3,
            )
            textureDetail = crystalNoise > 0.7 || crystalNoise < -0.7 ? depth * 1.2 : 0
            break
          case "pores":
            const poreNoise = noise(
              normalizedPos.x * scale * 4,
              normalizedPos.y * scale * 4,
              normalizedPos.z * scale * 4,
            )
            textureDetail = poreNoise > 0.8 ? depth * 1.5 : 0
            break
          case "grains":
            const grainNoise1 = noise(
              normalizedPos.x * scale * 8,
              normalizedPos.y * scale * 8,
              normalizedPos.z * scale * 8,
            )
            const grainNoise2 = noise(
              normalizedPos.x * scale * 12,
              normalizedPos.y * scale * 12,
              normalizedPos.z * scale * 12,
            )
            textureDetail = grainNoise1 * grainNoise2 * depth
            break
          default:
            const defaultNoise = noise(normalizedPos.x * scale, normalizedPos.y * scale, normalizedPos.z * scale)
            textureDetail = defaultNoise * depth * textureParams.irregularity
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

      colors.push(finalColor)
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
      // Gas giant material with bands
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

      material = new THREE.ShaderMaterial({
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

    return { surfaceGeometry: geometry, surfaceMaterial: material }
  }, [planetStats, planetType, biomeColors, heightMap])

  // Generate liquid mesh
  const { liquidGeometry, liquidMaterial } = useMemo(() => {
    if (planetType !== "terrestrial") {
      return { liquidGeometry: null, liquidMaterial: null }
    }

    // Determine if liquid should be visible
    const isLiquidVisible = planetStats.liquidEnabled !== false && (planetStats.waterLevel || 0) > 0 && liquidAvailable

    // Determine liquid color
    const liquidTypeColors = {
      water: new THREE.Color(0x1e78b4),
      methane: new THREE.Color(0x7fb3d5),
      nitrogen: new THREE.Color(0x90ee90),
      ammonia: new THREE.Color(0xd8bfd8),
      ethane: new THREE.Color(0xffd700),
    }

    const liquidColor =
      liquidTypeColors[planetStats.liquidType as keyof typeof liquidTypeColors] || liquidTypeColors.water

    // Adjust water color based on temperature and salinity
    if (planetStats.liquidType === "water") {
      if (planetStats.temperature < 283) {
        liquidColor.lerp(new THREE.Color(0x0047ab), 0.3)
      } else if (planetStats.temperature > 350) {
        liquidColor.lerp(new THREE.Color(0x006400), 0.2)
      }
      if (planetStats.salinity) {
        liquidColor.lerp(new THREE.Color(0x0047ab), planetStats.salinity * 0.5)
      }
    }

    // Create liquid material
    const material = new THREE.MeshPhysicalMaterial({
      color: liquidColor,
      transparent: true,
      opacity: isLiquidVisible ? 0.8 : 0,
      roughness: 0.1,
      metalness: 0.2,
      envMapIntensity: 0.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      ior: 1.4,
      transmission: 0.95,
    })

    // Create liquid geometry
    const effectiveWaterLevel = isLiquidVisible
      ? Math.max(planetStats.waterLevel || 0, 0.5)
      : planetStats.waterLevel || 0

    const waterRadius = planetStats.radius * (1 + effectiveWaterLevel * 0.02)
    const geometry = new THREE.IcosahedronGeometry(waterRadius, 9)

    // Apply subtle waves to liquid surface
    const positionAttribute = geometry.getAttribute("position")
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i),
        y = positionAttribute.getY(i),
        z = positionAttribute.getZ(i)
      const vertex = new THREE.Vector3(x, y, z)
      const normalizedPos = vertex.clone().normalize()
      const waveNoise = noise(normalizedPos.x * 10, normalizedPos.y * 10, normalizedPos.z * 10) * 0.005
      vertex.add(normalizedPos.clone().multiplyScalar(waveNoise))
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    positionAttribute.needsUpdate = true
    geometry.computeVertexNormals()

    return { liquidGeometry: geometry, liquidMaterial: material }
  }, [planetStats, planetType, liquidAvailable])

  // Generate atmosphere mesh
  const { atmosphereGeometry, atmosphereMaterial } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(planetStats.radius * 1.05, 9)
    let material

    if (planetType === "terrestrial") {
      const atmosphereColors = {
        water: new THREE.Color(0x87ceeb),
        co2: new THREE.Color(0xd3d3d3),
        methane: new THREE.Color(0x9acd32),
        snow: new THREE.Color(0xf0f8ff),
        none: new THREE.Color(0xadd8e6),
      }

      const atmosphereColor =
        atmosphereColors[planetStats.precipitationCompound as keyof typeof atmosphereColors] || atmosphereColors.none

      // Adjust atmosphere color based on temperature
      if (planetStats.temperature < 200) {
        atmosphereColor.lerp(new THREE.Color(0x4682b4), 0.3)
      } else if (planetStats.temperature > 350) {
        atmosphereColor.lerp(new THREE.Color(0xffa07a), 0.3)
      }

      // Atmosphere strength affects opacity
      const opacity = planetStats.atmosphereStrength ? planetStats.atmosphereStrength * 0.4 : 0.25

      material = new THREE.MeshPhongMaterial({
        color: atmosphereColor,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        shininess: 30,
        depthWrite: false,
      })
    } else {
      material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    }

    return { atmosphereGeometry: geometry, atmosphereMaterial: material }
  }, [planetStats, planetType])

  // Generate clouds
  const cloudMeshes = useMemo(() => {
    if (planetType !== "terrestrial" || !planetStats.cloudCount || planetStats.cloudCount <= 0) {
      return []
    }

    const cloudMeshes = []
    const cloudCount = Math.min(planetStats.cloudCount, 100)
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })

    for (let i = 0; i < cloudCount; i++) {
      const phi = Math.random() * Math.PI * 2
      const theta = Math.random() * Math.PI
      const x = Math.sin(theta) * Math.cos(phi)
      const y = Math.sin(theta) * Math.sin(phi)
      const z = Math.cos(theta)
      const pos = new THREE.Vector3(x, y, z).normalize()
      const size = 0.05 + Math.random() * 0.15

      // Create a unique key for each cloud
      const key = `cloud-${i}`

      // Store position, rotation and size instead of mesh
      cloudMeshes.push({
        key,
        position: pos.multiplyScalar(planetStats.radius * 1.02),
        size,
      })
    }

    return cloudMeshes
  }, [planetStats.cloudCount, planetStats.radius, planetType])

  // Rotate the planet
  useFrame(() => {
    if (refs.surface.current) refs.surface.current.rotation.y += 0.001
    if (refs.atmosphere.current) refs.atmosphere.current.rotation.y += 0.0005
    if (refs.liquid.current) refs.liquid.current.rotation.y += 0.0008
    if (refs.clouds.current) refs.clouds.current.rotation.y += 0.0012
  })

  return (
    <group>
      <mesh ref={refs.surface} geometry={surfaceGeometry} material={surfaceMaterial} />

      {planetType === "terrestrial" && liquidGeometry && liquidMaterial && (
        <mesh ref={refs.liquid} geometry={liquidGeometry} material={liquidMaterial} />
      )}

      <mesh ref={refs.atmosphere} geometry={atmosphereGeometry} material={atmosphereMaterial} />

      <group ref={refs.clouds}>
        {cloudMeshes.map((cloud) => (
          <mesh key={cloud.key} position={[cloud.position.x, cloud.position.y, cloud.position.z]}>
            <planeGeometry args={[cloud.size, cloud.size]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
            <group rotation={[0, Math.PI, 0]}>{/* This ensures the plane faces outward */}</group>
          </mesh>
        ))}
      </group>
    </group>
  )
}

