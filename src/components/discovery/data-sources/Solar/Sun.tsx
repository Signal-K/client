"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, Color } from "three";
import type * as THREE from "three";

interface SunProps {
  sunspots: number;
}

export function Sun({ sunspots }: SunProps) {
  const meshref = useRef<THREE.Mesh>(null);
  const sunspotGroupRef = useRef<THREE.Group>(null);

  // Load sun texture
  const texture = useLoader(TextureLoader, "/assets/Bodies/sun-texture.png");

  const sunspotPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < sunspots; i++) {
      // Generate random spherical coordinates to place the sunspots on
      const phi = Math.random() * Math.PI * 2; // azimuth
      const theta = Math.random() * Math.PI; // polar angle

      // Convert to cartesian coordinates on sphere surface
      const x = Math.sin(theta) * Math.cos(phi) * 0.99;
      const y = Math.sin(theta) * Math.sin(phi) * 0.99;
      const z = Math.cos(theta) * 0.99;

      positions.push([x, y, z]);
    }

    return positions;
  }, [sunspots]);

  // Animate sun rotation & sunspot pulsing
  useFrame((state) => {
    if (meshref.current) {
      meshref.current.rotation.y += 0.005;
    }

    if (sunspotGroupRef.current) {
      sunspotGroupRef.current.rotation.y += 0.005; // Same rotation as sun

      sunspotGroupRef.current.children.forEach((child, index) => {
        const scale =
          1 + Math.sin(state.clock.elapsedTime * 1.5 + index * 0.8) * 0.2;
        if (child.scale) {
          child.scale.set(scale, scale, scale);
        }
      });
    }
  });

  return (
    <group>
      {/* Main sun sphere */}
      <mesh ref={meshref} scale={1.3}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={new Color(0xffaa00)}
          emissiveIntensity={0.3}
        />
      </mesh>


      <group ref={sunspotGroupRef}>
        {sunspotPositions.map((position, index) => {
          const baseSize = 0.03 + Math.random() * 0.04; // Varied sizes between 0.03-0.07
          const darkness = 0.1 + Math.random() * 0.2; // Varied darkness

          return (
            <group key={index} position={position}>
              {/* Main dark sunspot */}
              <mesh>
                <sphereGeometry args={[baseSize, 12, 12]} />
                <meshStandardMaterial
                  color={new Color(darkness, darkness * 0.5, 0)}
                  emissive={new Color(0.05, 0.02, 0)}
                  emissiveIntensity={0.3}
                  roughness={0.9}
                />
              </mesh>

              {/* Penumbra (lighter outer ring) */}
              <mesh>
                <sphereGeometry args={[baseSize * 1.5, 12, 12]} />
                <meshStandardMaterial
                  color={
                    new Color(darkness * 2, darkness * 1.5, darkness * 0.5)
                  }
                  emissive={new Color(0.1, 0.05, 0)}
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.6}
                  roughness={0.8}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Sun glow effect */}
      <mesh scale={1.43}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={new Color(0xffaa00)}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}
