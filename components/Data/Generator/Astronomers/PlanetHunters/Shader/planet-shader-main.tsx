"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber"
import { Sphere, Html } from "@react-three/drei"
import * as THREE from "three"
import type { PlanetStats } from "@/lib/planet-physics"
import { getBiomeColors } from "@/lib/biome-data"
import { planetVertexShader } from "./planet-vertex-shader"
import { planetFragmentShader } from "./planet-fragment-shader"
import { atmosphereVertexShader, atmosphereFragmentShader } from "./atmosphere-shader"
import { cloudVertexShader, cloudFragmentShader } from "./cloud-shader"
import { PlanetInfoPanel } from "../Planet/planet-info-panel"
import { SurfacePointInfo } from "../Planet/planet-main"

interface PlanetShaderProps {
  planetStats: PlanetStats
};

export function PlanetShader({ planetStats }: PlanetShaderProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const [clickedPoint, setClickedPoint] = useState<SurfacePointInfo | null>(null)
  const { raycaster, camera, gl } = useThree()

  const { planetMaterial, atmosphereMaterial, cloudsMaterial } = useMemo(() => {
    // Get biome colors
    const biomeColors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands")

    // Create planet shader material
    const planetShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        oceanColor: { value: new THREE.Color(biomeColors.oceanFloor || "#1E4D6B") },
        beachColor: { value: new THREE.Color(biomeColors.beach || "#8D6E63") },
        landColor: { value: new THREE.Color(biomeColors.regular || "#A1887F") },
        mountainColor: { value: new THREE.Color(biomeColors.mountain || "#D7CCC8") },
        waterLevel: { value: planetStats.waterLevel || 0.65 },
        surfaceRoughness: { value: planetStats.surfaceRoughness || 0.5 },
        mountainHeight: { value: planetStats.mountainHeight || 0.6 },
        isGaseous: { value: planetStats.mass > 7 || planetStats.radius > 2.5 ? 1.0 : 0.0 },
        soilType: {
          value: ["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].indexOf(
            planetStats.soilType || "rocky",
          ),
        },
        soilTexture: {
          value: ["smooth", "rough", "cracked", "layered", "porous", "grainy", "crystalline"].indexOf(
            planetStats.soilTexture || "rough",
          ),
        },
        liquidEnabled: { value: planetStats.liquidEnabled !== false ? 1.0 : 0.0 },
        landmarkPositions: { value: new Float32Array(30) }, // Initialize with empty arrays
        landmarkInfluences: { value: new Float32Array(40) },
        landmarkCount: { value: 0 },
      },
      vertexShader: planetVertexShader,
      fragmentShader: planetFragmentShader,
    })

    // Create atmosphere shader
    const atmosphereShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x87ceeb) },
        strength: { value: planetStats.atmosphereStrength || 0.8 },
      },
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    // Create cloud shader
    const cloudShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cloudCount: { value: planetStats.cloudCount || 30 },
      },
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      transparent: true,
      depthWrite: false,
    })

    return {
      planetMaterial: planetShader,
      atmosphereMaterial: atmosphereShader,
      cloudsMaterial: cloudShader,
    }
  }, [planetStats])

  // Update landmark uniforms when landmarks change
  useEffect(() => {
    if (!planetStats.landmarks || planetStats.landmarks.length === 0) {
      planetMaterial.uniforms.landmarkCount.value = 0
      return
    }

    // Limit to 10 landmarks (shader array size limit)
    const landmarksToUse = planetStats.landmarks.slice(0, 10)

    // Create flat arrays for landmark positions and influences
    const positionsArray: number[] = []
    const influencesArray: number[] = []

    landmarksToUse.forEach((landmark) => {
      // Normalize position and add to positions array
      const pos = new THREE.Vector3(landmark.coordinates.x, landmark.coordinates.y, landmark.coordinates.z).normalize()
      positionsArray.push(pos.x, pos.y, pos.z)

      // Map influence type to a number for the shader
      let typeValue = 1.0 // Default to mountain
      switch (landmark.influence_type) {
        case "crater":
          typeValue = 0.0
          break
        case "mountain":
          typeValue = 1.0
          break
        case "valley":
          typeValue = 2.0
          break
        case "volcano":
          typeValue = 3.0
          break
        case "glacier":
          typeValue = 4.0
          break
        case "basin":
          typeValue = 5.0
          break
        default:
          typeValue = 6.0 // Custom or other types
      }

      // Add influence values to the array
      influencesArray.push(
        landmark.influence_radius || 0.5,
        landmark.influence_strength || 0.7,
        landmark.influence_roughness || 0.5,
        typeValue,
      )
    })

    // Update shader uniforms with flat arrays
    planetMaterial.uniforms.landmarkPositions.value = positionsArray
    planetMaterial.uniforms.landmarkInfluences.value = influencesArray
    planetMaterial.uniforms.landmarkCount.value = landmarksToUse.length
  }, [planetStats.landmarks, planetMaterial.uniforms])

  // Handle click on planet surface
  const handlePlanetClick = (event: ThreeEvent<MouseEvent>) => {
    // Prevent event from propagating
    event.stopPropagation()

    if (!planetRef.current) return

    // Get mouse position
    const mouse = new THREE.Vector2(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1,
    )

    // Update raycaster
    raycaster.setFromCamera(mouse, camera)

    // Check for intersections with the planet surface
    const intersects = raycaster.intersectObject(planetRef.current)

    if (intersects.length > 0) {
      const point = intersects[0].point
      const normalizedPoint = point.clone().normalize()

      // Get elevation from vertex shader
      // This is an approximation since we can't directly access shader variables
      const elevation =
        planetMaterial.uniforms.surfaceRoughness.value *
        planetMaterial.uniforms.mountainHeight.value *
        0.08 *
        Math.sin(point.x * 10 + point.y * 10 + point.z * 10)

      // Determine terrain type based on elevation and water level
      const waterLevel = planetMaterial.uniforms.waterLevel.value
      let terrainType = "Mountain"
      if (elevation < -0.05) terrainType = "Ocean Floor"
      else if (elevation < waterLevel) terrainType = "Beach"
      else if (elevation < waterLevel + 0.1) terrainType = "Lowland"

      // Calculate temperature at this point (simplified model)
      const baseTemp = planetStats.temperature
      const heightEffect = elevation * 10 // 10 degrees per unit of height
      const pointTemp = baseTemp - heightEffect

      // Water freezing point (assuming water-like liquid)
      const waterFreezeTemp = 273 // Kelvin
      const relativeTemp = pointTemp - waterFreezeTemp

      setClickedPoint({
        position: point,
        normalizedPosition: normalizedPoint,
        height: elevation,
        terrainType,
        temperature: pointTemp,
        relativeToWaterTemp: relativeTemp,
      })
    }
  }

  // Update uniforms on each frame
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
      planetMaterial.uniforms.time.value = state.clock.elapsedTime
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
      atmosphereMaterial.uniforms.time.value = state.clock.elapsedTime
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0012
      cloudsMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  const isGaseous = planetStats.mass > 7 || planetStats.radius > 2.5
  const showClouds = !isGaseous && planetStats.cloudCount && planetStats.cloudCount > 0

  // Function to determine planet type
  const determinePlanetType = (mass: number, radius: number): "terrestrial" | "gaseous" => {
    return mass > 7 || radius > 2.5 ? "gaseous" : "terrestrial"
  }

  // Update the landmarkMarkers in PlanetShader to only show active landmarks
  // Landmark markers
  const landmarkMarkers = useMemo(() => {
    if (!planetStats.landmarks || planetStats.landmarks.length === 0) return null

    const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
    const isGasGiant = planetType === "gaseous"

    // Only show landmarks that match the current planet type
    const activeLandmarks = planetStats.landmarks.filter((landmark) => {
      if (!landmark.category) {
        // If no category is specified, infer from influence type
        const gasTypes = ["storm", "vortex", "band", "spot", "turbulent", "cyclone", "anticyclone", "zonal_flow"]
        return isGasGiant
          ? gasTypes.includes(landmark.influence_type || "")
          : !gasTypes.includes(landmark.influence_type || "")
      }
      return isGasGiant ? landmark.category === "gaseous" : landmark.category === "terrestrial"
    })

    return activeLandmarks.map((landmark, index) => {
      // Calculate position on planet surface
      const { x, y, z } = landmark.coordinates
      const position = new THREE.Vector3(x, y, z).normalize().multiplyScalar(planetStats.radius * 1.02)

      // Determine marker color based on landmark type
      let markerColor = "#22c55e" // Default green

      if (landmark.type.includes("Volcano") || landmark.type.includes("Storm")) {
        markerColor = "#ef4444" // Red for volcanic/storm features
      } else if (landmark.type.includes("Ocean") || landmark.type.includes("Water")) {
        markerColor = "#3b82f6" // Blue for water features
      } else if (landmark.type.includes("Ice") || landmark.type.includes("Frozen")) {
        markerColor = "#a5f3fc" // Light blue for ice features
      } else if (landmark.type.includes("Sand") || landmark.type.includes("Desert")) {
        markerColor = "#fcd34d" // Yellow for desert features
      }

      // Determine if landmark has visual effects
      const hasVisualEffect = landmark.visual_effect && landmark.visual_effect !== "None"

      return (
        <group key={index} position={[position.x, position.y, position.z]}>
          {/* Marker sphere */}
          <mesh>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshBasicMaterial color={markerColor} />
          </mesh>

          {/* Pulse effect for landmarks with visual effects */}
          {hasVisualEffect && (
            <mesh>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color={markerColor} transparent={true} opacity={0.3} depthWrite={false} />
            </mesh>
          )}

          {/* Label */}
          <Html position={[0, 0.1, 0]} center distanceFactor={10} occlude>
            <div className="bg-black/80 text-green-400 px-2 py-1 text-xs font-mono rounded border border-green-500/50 whitespace-nowrap">
              {landmark.classification_id}
            </div>
          </Html>
        </group>
      )
    })
  }, [planetStats.landmarks, planetStats.radius, planetStats.mass])

  return (
    <>
      <group onClick={handlePlanetClick}>
        {/* Doubled resolution from 128 to 256 segments */}
        <Sphere ref={planetRef} args={[1, 256, 256]} scale={planetStats.radius}>
          <primitive object={planetMaterial} attach="material" />
        </Sphere>

        {/* Increased atmosphere resolution and size */}
        <Sphere ref={atmosphereRef} args={[1.1, 128, 128]} scale={planetStats.radius}>
          <primitive object={atmosphereMaterial} attach="material" />
        </Sphere>

        {showClouds && (
          /* Increased clouds resolution */
          <Sphere ref={cloudsRef} args={[1.02, 128, 128]} scale={planetStats.radius}>
            <primitive object={cloudsMaterial} attach="material" />
          </Sphere>
        )}

        {/* Landmark markers */}
        {landmarkMarkers}
      </group>

      {clickedPoint && <PlanetInfoPanel pointInfo={clickedPoint} planetStats={planetStats} />}
    </>
  )
};