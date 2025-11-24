"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { type ChildClassification } from "@/src/components/discovery/planets/physics";

interface ChildClassificationMarkerProps {
  classification: ChildClassification;
  planetRadius: number;
  onClassificationClick?: (classification: ChildClassification) => void;
}

// Color mapping for different classification types
const getTypeColor = (type: string): { color: string; emissive: string } => {
  const typeColors: Record<string, { color: string; emissive: string }> = {
    "cloud": { color: "#E8F4F8", emissive: "#FFFFFF" },
    "zoodex-mars": { color: "#FFA500", emissive: "#FF8C00" },
    "planet-4": { color: "#CD853F", emissive: "#D2691E" },
    "compass": { color: "#4169E1", emissive: "#1E90FF" },
    "waypoint": { color: "#32CD32", emissive: "#228B22" },
    "anomaly": { color: "#FF1493", emissive: "#FF69B4" },
    "structure": { color: "#A0522D", emissive: "#8B4513" },
    "lifeform": { color: "#00FF7F", emissive: "#00FA9A" },
  };

  // Try to match the type with known types
  const lowerType = type.toLowerCase();
  for (const [key, colors] of Object.entries(typeColors)) {
    if (lowerType.includes(key)) {
      return colors;
    }
  }

  // Default color for unknown types
  return { color: "#FFFFFF", emissive: "#CCCCCC" };
};

export default function ChildClassificationMarker({ 
  classification, 
  planetRadius,
  onClassificationClick 
}: ChildClassificationMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Convert lat/long to 3D position on sphere
  const position = new THREE.Vector3();
  const lat = THREE.MathUtils.degToRad(classification.position.latitude);
  const lon = THREE.MathUtils.degToRad(classification.position.longitude);
  
  // Slightly above surface
  const radius = planetRadius * 1.015;
  position.x = radius * Math.cos(lat) * Math.cos(lon);
  position.y = radius * Math.sin(lat);
  position.z = radius * Math.cos(lat) * Math.sin(lon);

  // Label position
  const labelPosition = position.clone().multiplyScalar(1.25);

  // Get colors for this classification type
  const { color, emissive } = getTypeColor(classification.type);

  // Small marker size
  const markerSize = 0.015 * planetRadius;

  // Gentle pulse
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Marker on planet surface */}
      <mesh
        ref={meshRef}
        position={position}
        scale={markerSize}
        onClick={(e) => {
          e.stopPropagation();
          onClassificationClick?.(classification);
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
        {/* Main marker - using cone/pyramid shape for variety */}
        <coneGeometry args={[1, 2, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Small glow */}
      <mesh position={position} scale={markerSize * 1.3}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={emissive}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <>
          <Line
            points={[position, labelPosition]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.3}
          />

          <Html
            position={labelPosition}
            center
            distanceFactor={8}
            occlude={false}
          >
            <div className="bg-black/90 text-white px-2 py-1 rounded text-xs whitespace-nowrap border border-white/20 shadow-lg backdrop-blur-sm">
              <div className="font-semibold capitalize">
                {classification.type.replace(/-/g, ' ')}
              </div>
              {classification.content && (
                <div className="text-[10px] text-gray-300 max-w-[150px] truncate">
                  {classification.content}
                </div>
              )}
              <div className="text-[10px] text-blue-300 mt-0.5">
                ID: {classification.id}
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}
