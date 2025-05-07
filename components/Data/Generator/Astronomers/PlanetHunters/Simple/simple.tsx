"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Sphere } from "@react-three/drei"
import { type PlanetStats, determinePlanetType } from "@/lib/planet-physics"
import { getBiomeColors } from "@/lib/biome-data"

interface SimplePlanetProps {
  planetStats: PlanetStats
}

export function SimplePlanet({ planetStats }: SimplePlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)

  // Create simplified materials based on planet type and biome
  const materials = useMemo(() => {
    const biomeColors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands")

    // Base planet material
    const mainColor = new THREE.Color(biomeColors.regular || "#A1887F")
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.7,
      metalness: 0.1,
    })

    // Atmosphere material
    const atmosphereColor = planetType === "terrestrial" ? new THREE.Color(0x87ceeb) : new THREE.Color(0xffffff)

    const atmosphereOpacity =
      planetType === "terrestrial"
        ? planetStats.atmosphereStrength
          ? planetStats.atmosphereStrength * 0.4
          : 0.25
        : 0.15

    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: atmosphereColor,
      transparent: true,
      opacity: atmosphereOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    return { planetMaterial, atmosphereMaterial }
  }, [planetStats, planetType])

  // Simple rotation animation
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
    }
  })

  return (
    <group>
      {/* Main planet */}
      <Sphere ref={planetRef} args={[1, 64, 64]} scale={planetStats.radius}>
        <primitive object={materials.planetMaterial} attach="material" />
      </Sphere>

      {/* Atmosphere */}
      <Sphere ref={atmosphereRef} args={[1.1, 32, 32]} scale={planetStats.radius}>
        <primitive object={materials.atmosphereMaterial} attach="material" />
      </Sphere>
    </group>
  )
};