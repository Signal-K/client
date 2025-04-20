"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import type { PlanetStats } from "@/lib/planet-physics";

interface PlanetCloudsProps {
  planetStats: PlanetStats;
};

export const PlanetClouds = forwardRef<THREE.Group, PlanetCloudsProps>(function PlanetClouds({ planetStats }, ref) {
  // Generate clouds
  const cloudMeshes = useMemo(() => {
    if (!planetStats.cloudCount || planetStats.cloudCount <= 0) {
      return []
    };

    const cloudMeshes = [];
    const cloudCount = Math.min(planetStats.cloudCount, 100);

    for (let i = 0; i < cloudCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const x = Math.sin(theta) * Math.cos(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(theta);
      const pos = new THREE.Vector3(x, y, z).normalize();
      const size = 0.05 + Math.random() * 0.15;

      // Create a unique key for each cloud
      const key = `cloud-${i}`;

      // Store position, rotation and size
      cloudMeshes.push({
        key,
        position: pos.multiplyScalar(planetStats.radius * 1.02),
        size,
      });
    };

    return cloudMeshes;
  }, [planetStats.cloudCount, planetStats.radius]);

  return (
    <group ref={ref}>
      {cloudMeshes.map((cloud) => (
        <mesh key={cloud.key} position={[cloud.position.x, cloud.position.y, cloud.position.z]}>
          <planeGeometry args={[cloud.size, cloud.size]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
          <group rotation={[0, Math.PI, 0]} />
        </mesh>
      ))}
    </group>
  );
});