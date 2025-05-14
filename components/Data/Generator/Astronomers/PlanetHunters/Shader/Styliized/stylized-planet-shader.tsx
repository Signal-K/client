"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetStats } from "@/lib/planet-physics";
import { getBiomeColors } from "@/lib/biome-data";
import { stylizedVertexShader } from "./stylized-vertex-shader";
import { stylizedFragmentShader } from "./stylized-fragment-shader";

interface StylizedPlanetShaderProps {
  planetStats: PlanetStats
}

export function StylizedPlanetShader({ planetStats }: StylizedPlanetShaderProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  const planetMaterial = useMemo(() => {
    // Get biome colors
    const biomeColors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands")

    // Create planet shader material
    const shader = new THREE.ShaderMaterial({
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
      vertexShader: stylizedVertexShader,
      fragmentShader: stylizedFragmentShader,
    })

    materialRef.current = shader
    return shader
  }, [])

  // Update landmark uniforms when landmarks change
  useEffect(() => {
    if (!materialRef.current || !planetStats.landmarks || planetStats.landmarks.length === 0) {
      if (materialRef.current) {
        materialRef.current.uniforms.landmarkCount.value = 0
      }
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
    materialRef.current.uniforms.landmarkPositions.value = new Float32Array(positionsArray)
    materialRef.current.uniforms.landmarkInfluences.value = new Float32Array(influencesArray)
    materialRef.current.uniforms.landmarkCount.value = landmarksToUse.length
  }, [planetStats.landmarks])

  // Update uniforms when planet stats change
  useEffect(() => {
    if (!materialRef.current) return

    // Get biome colors
    const biomeColors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands")

    // Update material uniforms
    materialRef.current.uniforms.oceanColor.value = new THREE.Color(biomeColors.oceanFloor || "#1E4D6B")
    materialRef.current.uniforms.beachColor.value = new THREE.Color(biomeColors.beach || "#8D6E63")
    materialRef.current.uniforms.landColor.value = new THREE.Color(biomeColors.regular || "#A1887F")
    materialRef.current.uniforms.mountainColor.value = new THREE.Color(biomeColors.mountain || "#D7CCC8")
    materialRef.current.uniforms.waterLevel.value = planetStats.waterLevel || 0.65
    materialRef.current.uniforms.surfaceRoughness.value = planetStats.surfaceRoughness || 0.5
    materialRef.current.uniforms.mountainHeight.value = planetStats.mountainHeight || 0.6
    materialRef.current.uniforms.isGaseous.value = planetStats.mass > 7 || planetStats.radius > 2.5 ? 1.0 : 0.0
    materialRef.current.uniforms.soilType.value = [
      "rocky",
      "sandy",
      "volcanic",
      "organic",
      "dusty",
      "frozen",
      "muddy",
    ].indexOf(planetStats.soilType || "rocky")
    materialRef.current.uniforms.soilTexture.value = [
      "smooth",
      "rough",
      "cracked",
      "layered",
      "porous",
      "grainy",
      "crystalline",
    ].indexOf(planetStats.soilTexture || "rough")
    materialRef.current.uniforms.liquidEnabled.value = planetStats.liquidEnabled !== false ? 1.0 : 0.0
  }, [planetStats])

  // Update uniforms on each frame
  useFrame((state) => {
    if (planetRef.current && materialRef.current) {
      planetRef.current.rotation.y += 0.001
      materialRef.current.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <Sphere ref={planetRef} args={[1, 128, 128]} scale={planetStats.radius}>
      <primitive object={planetMaterial} attach="material" />
    </Sphere>
  )
}
