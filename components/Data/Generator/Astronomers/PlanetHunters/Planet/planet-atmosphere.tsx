"use client"

import { forwardRef, useMemo } from "react"
import * as THREE from "three"
import { type PlanetStats, determinePlanetType } from "@/lib/planet-physics"

interface PlanetAtmosphereProps {
  planetStats: PlanetStats
}

export const PlanetAtmosphere = forwardRef<THREE.Mesh, PlanetAtmosphereProps>(function PlanetAtmosphere(
  { planetStats },
  ref,
) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)

  // Generate atmosphere mesh
  const { atmosphereGeometry, atmosphereMaterial } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(planetStats.radius * 1.1, 9)
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

  return <mesh ref={ref} geometry={atmosphereGeometry} material={atmosphereMaterial} />
})