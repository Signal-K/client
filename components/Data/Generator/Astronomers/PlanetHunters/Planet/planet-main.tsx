"use client";

import { useRef, useState } from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { type PlanetStats, determinePlanetType } from "@/lib/planet-physics";
import { PlanetSurface } from "./planet-surface";
import { PlanetLiquid } from "./planet-liquid";
import { PlanetAtmosphere } from "./planet-atmosphere";
import { PlanetClouds } from "./planet-clouds";
import { PlanetInfoPanel } from "./planet-info-panel";
import { PlanetLandmarks } from "./planet-landmarks";

export interface SurfacePointInfo {
  position: THREE.Vector3
  normalizedPosition: THREE.Vector3
  height: number
  terrainType: string
  temperature: number
  relativeToWaterTemp: number
};

export function Planet({ planetStats }: { planetStats: PlanetStats }) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const [clickedPoint, setClickedPoint] = useState<SurfacePointInfo | null>(null)
  const { raycaster, camera, gl } = useThree()

  // References for rotation
  const refs = {
    surface: useRef<THREE.Mesh>(null),
    atmosphere: useRef<THREE.Mesh>(null),
    liquid: useRef<THREE.Mesh>(null),
    clouds: useRef<THREE.Group>(null),
    group: useRef<THREE.Group>(null),
  }

  // Handle click on planet surface
  const handlePlanetClick = (event: ThreeEvent<MouseEvent>) => {
    // Prevent event from propagating
    event.stopPropagation()

    if (!refs.surface.current) return

    // Get mouse position
    const mouse = new THREE.Vector2(
      (event.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(event.clientY / gl.domElement.clientHeight) * 2 + 1,
    )

    // Update raycaster
    raycaster.setFromCamera(mouse, camera)

    // Check for intersections with the planet surface
    const intersects = raycaster.intersectObject(refs.surface.current)

    if (intersects.length > 0) {
      const point = intersects[0].point
      const normalizedPoint = point.clone().normalize()

      // Calculate height (distance from center minus base radius)
      const height = point.length() - planetStats.radius

      // Determine terrain type based on height
      let terrainType = "Mountain"
      if (height < -0.05) terrainType = "Ocean Floor"
      else if (height < 0) terrainType = "Beach"
      else if (height < 0.05) terrainType = "Lowland"

      // Calculate temperature at this point (simplified model)
      // Base temperature adjusted by height (lower at higher elevations)
      const baseTemp = planetStats.temperature
      const heightEffect = height * 10 // 10 degrees per unit of height
      const pointTemp = baseTemp - heightEffect

      // Water freezing point (assuming water-like liquid)
      const waterFreezeTemp = 273 // Kelvin
      const relativeTemp = pointTemp - waterFreezeTemp

      setClickedPoint({
        position: point,
        normalizedPosition: normalizedPoint,
        height,
        terrainType,
        temperature: pointTemp,
        relativeToWaterTemp: relativeTemp,
      })
    }
  }

  // Rotate the planet
  useFrame(() => {
    if (refs.surface.current) refs.surface.current.rotation.y += 0.001
    if (refs.atmosphere.current) refs.atmosphere.current.rotation.y += 0.0005
    if (refs.liquid.current) refs.liquid.current.rotation.y += 0.0008
    if (refs.clouds.current) refs.clouds.current.rotation.y += 0.0012
  })

  return (
    <>
      <group ref={refs.group} onClick={handlePlanetClick}>
        <PlanetSurface planetStats={planetStats} ref={refs.surface} />

        {planetType === "terrestrial" && <PlanetLiquid planetStats={planetStats} ref={refs.liquid} />}

        <PlanetAtmosphere planetStats={planetStats} ref={refs.atmosphere} />

        {planetType === "terrestrial" && planetStats.cloudCount && planetStats.cloudCount > 0 && (
          <PlanetClouds planetStats={planetStats} ref={refs.clouds} />
        )}

        {/* Add landmarks visualization */}
        {planetStats.landmarks && planetStats.landmarks.length > 0 && <PlanetLandmarks planetStats={planetStats} />}
      </group>

      {clickedPoint && <PlanetInfoPanel pointInfo={clickedPoint} planetStats={planetStats} />}
    </>
  );
};