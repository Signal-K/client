"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { type PlanetStats, isLiquidAvailable, determineLiquidType } from "@/lib/planet-physics";
import { noise } from "@/lib/noise";

interface PlanetLiquidProps {
  planetStats: PlanetStats;
};

export const PlanetLiquid = forwardRef<THREE.Mesh, PlanetLiquidProps>(function PlanetLiquid({ planetStats }, ref) {
  const liquidInfo = determineLiquidType(planetStats.temperature);
  const liquidAvailable = isLiquidAvailable(planetStats.temperature, planetStats.liquidType || liquidInfo.type);

  // Generate liquid mesh
  const { liquidGeometry, liquidMaterial } = useMemo(() => {
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
  }, [planetStats, liquidAvailable])

  if (!liquidGeometry || !liquidMaterial) return null

  return <mesh ref={ref} geometry={liquidGeometry} material={liquidMaterial} />
});