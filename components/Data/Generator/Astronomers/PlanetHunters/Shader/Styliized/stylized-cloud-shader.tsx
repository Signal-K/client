"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetStats } from "@/lib/planet-physics";

interface StylizedCloudsProps {
  planetStats: PlanetStats;
};

export function StylizedClouds({ planetStats }: StylizedCloudsProps) {
  const cloudsRef = useRef<THREE.Mesh>(null)

  // Skip clouds for gas giants
  const isGaseous = planetStats.mass > 7 || planetStats.radius > 2.5
  const shouldRenderClouds = !isGaseous && planetStats.cloudCount && planetStats.cloudCount !== 0

  // Create stylized clouds material
  const cloudsMaterial = useRef<THREE.MeshPhysicalMaterial>(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.7,
      roughness: 1,
      metalness: 0,
      clearcoat: 0.1,
      clearcoatRoughness: 0.4,
      alphaMap: new THREE.TextureLoader().load("/assets/clouds-alpha.png"),
      side: THREE.DoubleSide,
    }),
  )

  // Update clouds on each frame
  useFrame(() => {
    if (shouldRenderClouds && cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005
    }
  })

  return shouldRenderClouds ? (
    <Sphere ref={cloudsRef} args={[1.02, 64, 64]} scale={planetStats.radius}>
      <primitive object={cloudsMaterial.current} attach="material" />
    </Sphere>
  ) : null
};