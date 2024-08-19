import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshBasicMaterial, SphereGeometry } from 'three';

const Star = ({ metallicity, luminosity, mass, color }: StarProps) => {
  const starRef = useRef<THREE.Mesh>();

  // Calculate size based on luminosity and mass
  const starSize = 1 + 5 * luminosity * mass;

  // Calculate color based on metallicity
  const starColor = `rgb(${255 * (1 - metallicity)}, ${255 * (1 - metallicity)}, 255)`;

  useFrame(() => {
    if (starRef.current) {
      starRef.current.rotation.x += 0.001;
      starRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={starRef}>
      <sphereGeometry args={[starSize, 32, 32]} />
      <meshBasicMaterial color={starColor} />
    </mesh>
  );
};

interface StarProps {
  metallicity: number;
  luminosity: number;
  mass: number;
  color: string;
}

const StarViewer = () => {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Star metallicity={0.7} luminosity={0.8} mass={0.6} color="yellow" />
      </Canvas>
    </div>
  );
};

export default StarViewer;