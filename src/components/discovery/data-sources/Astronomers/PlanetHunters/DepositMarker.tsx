"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { type MineralDeposit, getDepositVisuals } from "@/src/components/discovery/planets/physics";

interface DepositMarkerProps {
  deposit: MineralDeposit;
  planetRadius: number;
  temperature: number;
  onDepositClick?: (deposit: MineralDeposit) => void;
}

export default function DepositMarker({ 
  deposit, 
  planetRadius, 
  temperature,
  onDepositClick 
}: DepositMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Convert lat/long to 3D position on sphere
  const position = new THREE.Vector3();
  const lat = THREE.MathUtils.degToRad(deposit.position.latitude);
  const lon = THREE.MathUtils.degToRad(deposit.position.longitude);
  
  // Spherical to Cartesian conversion
  // Slightly above surface to avoid z-fighting
  const radius = planetRadius * 1.01;
  position.x = radius * Math.cos(lat) * Math.cos(lon);
  position.y = radius * Math.sin(lat);
  position.z = radius * Math.cos(lat) * Math.sin(lon);

  // Get visual properties based on deposit type and state
  const visuals = deposit.color 
    ? { color: deposit.color, emissive: deposit.color, intensity: 0.3 }
    : getDepositVisuals(deposit.type, deposit.state, temperature);

  // Smaller deposit size for subtlety
  const depositSize = Math.max(0.02, deposit.size * 0.5) * planetRadius;

  // Label position (closer to planet for less obtrusiveness)
  const labelPosition = position.clone().multiplyScalar(1.3);

  // Pulse effect for deposits (more subtle)
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Deposit marker on planet surface */}
      <mesh
        ref={meshRef}
        position={position}
        scale={depositSize}
        onClick={(e) => {
          e.stopPropagation();
          onDepositClick?.(deposit);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        {/* Main deposit sphere */}
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={visuals.color}
          emissive={visuals.emissive}
          emissiveIntensity={visuals.intensity * 1.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Smaller glow effect */}
      <mesh position={position} scale={depositSize * 1.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={visuals.emissive}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Connection line from deposit to label - only on hover */}
      {hovered && (
        <>
          <Line
            points={[position, labelPosition]}
            color={visuals.color}
            lineWidth={1}
            transparent
            opacity={0.4}
          />

          {/* Floating label */}
          <Html
            position={labelPosition}
            center
            distanceFactor={10}
            occlude={false}
          >
            <div className="relative">
              {/* Label container - smaller */}
              <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-white/20 shadow-lg backdrop-blur-sm">
                <div className="font-semibold capitalize text-white">
                  {deposit.type.replace(/-/g, ' ')}
                </div>
                <div className="text-[10px] text-gray-300">
                  {deposit.state} • {deposit.purity ? `${deposit.purity.toFixed(0)}%` : 'Unknown'}
                </div>
                {deposit.amount && (
                  <div className="text-[10px] text-gray-400">
                    {deposit.amount.toFixed(1)} units
                  </div>
                )}
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
