"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetConfig } from "@/utils/planet-physics";
import { vertexShader } from "@/utils/Generators/PH/vertex-shader";
import { fragmentShader } from "@/utils/Generators/PH/fragment-shader";

interface PlanetProps {
  config: PlanetConfig
};

export default function Planet({ config }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Create shader material with uniforms based on planet config
  const shaderMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        seed: { value: config.seed },
        radius: { value: config.radius },
        isGaseous: { value: config.type === "gaseous" ? 1.0 : 0.0 },
        surfaceRoughness: { value: config.terrainRoughness },
        liquidHeight: { value: config.liquidHeight },
        volcanicActivity: { value: config.volcanicActivity },
        temperature: { value: config.temperature },
        biomass: { value: config.biomass },
        continentSize: { value: config.continentSize },
        continentCount: { value: config.continentCount },
        noiseScale: { value: config.noiseScale },
        debugMode: { value: config.debugMode ? 1.0 : 0.0 },
        visibleTerrains: {
          value: new THREE.Vector4(
            config.visibleTerrains?.ocean ? 1.0 : 0.0,
            config.visibleTerrains?.beach ? 1.0 : 0.0,
            config.visibleTerrains?.lowland ? 1.0 : 0.0,
            config.visibleTerrains?.midland ? 1.0 : 0.0,
          ),
        },
        visibleTerrains2: {
          value: new THREE.Vector4(
            config.visibleTerrains?.highland ? 1.0 : 0.0,
            config.visibleTerrains?.mountain ? 1.0 : 0.0,
            config.visibleTerrains?.snow ? 1.0 : 0.0,
            0.0,
          ),
        },

        // Colors
        atmosphereColor: { value: new THREE.Color(config.colors.atmosphere) },
        oceanColor: { value: new THREE.Color(config.colors.ocean) },
        oceanPatternColor: { value: new THREE.Color(config.colors.oceanPattern) },
        beachColor: { value: new THREE.Color(config.colors.beach) },
        lowlandColor: { value: new THREE.Color(config.colors.lowland) },
        midlandColor: { value: new THREE.Color(config.colors.midland) },
        highlandColor: { value: new THREE.Color(config.colors.highland) },
        mountainColor: { value: new THREE.Color(config.colors.mountain) },
        snowColor: { value: new THREE.Color(config.colors.snow) },
      },
    })

    return material
  }, [config]) // Update when any config property changes

  // Set the material ref after the material is created
  useEffect(() => {
    if (shaderMaterial) {
      materialRef.current = shaderMaterial
    }
  }, [shaderMaterial])

  // Auto-rotate the planet and update time uniform
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
    }

    if (materialRef.current) {
      // Only animate certain aspects with time
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime()
    }
  })

  // Create planet mesh with appropriate geometry based on type
  return (
    <group>
      <mesh ref={meshRef} scale={config.radius}>
        <sphereGeometry args={[1, 128, 128]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Add atmosphere */}
      <mesh ref={atmosphereRef} scale={config.radius * (config.type === "gaseous" ? 1.15 : 1.05)}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color={config.colors.atmosphere}
          transparent={true}
          opacity={config.type === "gaseous" ? 0.7 : 0.3}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};