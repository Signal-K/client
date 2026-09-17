'use client'

import { useRef, useState } from 'react'
import { Cylinder, Box, Sphere } from '@react-three/drei'
import type { Mesh, Group } from 'three'
import type { StructureInfo } from './Colony3D'

interface StructuresProps {
  structures: Record<string, StructureInfo>
  onSelectStructure: (id: string) => void
}

export function Structures({ structures, onSelectStructure }: StructuresProps) {
  const groupRef = useRef<Group>(null);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);

  const handlePointerOver = (structureId: string) => {
    setHoveredStructure(structureId);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHoveredStructure(null);
    document.body.style.cursor = 'default';
  };

  const getStructureScale = (level: number) => {
    return 0.5 + (level - 1) * 0.1;
  };

  return (
    <group ref={groupRef} position={[0, 2, 0]} scale={[0.7, 0.7, 0.7]}>
      {/* Habitat Dome */}
      <group 
        position={[-8, 1, 0]}
        onClick={() => onSelectStructure('habitat')}
        onPointerOver={() => handlePointerOver('habitat')}
        onPointerOut={handlePointerOut}
        scale={[getStructureScale(structures.habitat.level), getStructureScale(structures.habitat.level), getStructureScale(structures.habitat.level)]}
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial 
            color={hoveredStructure === 'habitat' ? "#70e1ff" : structures.habitat.color} 
            metalness={0.5} 
            roughness={0.2} 
          />
        </mesh>
        <Cylinder args={[2, 2, 0.2]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'habitat' ? "#70e1ff" : structures.habitat.color} />
        </Cylinder>
        {structures.habitat.level >= 3 && (
          <Cylinder args={[0.5, 0.5, 3]} position={[1.5, 1.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'habitat' ? "#70e1ff" : structures.habitat.color} />
          </Cylinder>
        )}
        {structures.habitat.level >= 5 && (
          <Box args={[1, 1, 1]} position={[-1.5, 1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'habitat' ? "#70e1ff" : structures.habitat.color} />
          </Box>
        )}
      </group>

      {/* Research Station */}
      <group 
        position={[-4, 0, 0]}
        onClick={() => onSelectStructure('research')}
        onPointerOver={() => handlePointerOver('research')}
        onPointerOut={handlePointerOut}
        scale={[getStructureScale(structures.research.level), getStructureScale(structures.research.level), getStructureScale(structures.research.level)]}
      >
        <Box args={[3, 2, 4]} position={[0, 1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'research' ? "#70e1ff" : structures.research.color} />
        </Box>
        <Box args={[1, 3, 1]} position={[1, 1.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'research' ? "#70e1ff" : structures.research.color} />
        </Box>
        <Cylinder args={[0.3, 0.3, 4]} position={[1, 3, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'research' ? "#70e1ff" : structures.research.color} />
        </Cylinder>
        {structures.research.level >= 3 && (
          <Sphere args={[0.5, 16, 16]} position={[1, 5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'research' ? "#70e1ff" : structures.research.color} />
          </Sphere>
        )}
        {structures.research.level >= 5 && (
          <Box args={[2, 1, 2]} position={[-1, 1.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'research' ? "#70e1ff" : structures.research.color} />
          </Box>
        )}
      </group>

      {/* Solar Array */}
      <group 
        position={[0, 0.5, 0]}
        onClick={() => onSelectStructure('solar')}
        onPointerOver={() => handlePointerOver('solar')}
        onPointerOut={handlePointerOut}
        scale={[getStructureScale(structures.solar.level), getStructureScale(structures.solar.level), getStructureScale(structures.solar.level)]}
      >
        {[...Array(structures.solar.level)].map((_, i) => (
          <group key={i} position={[i * 2 - 2, 0, 0]}>
            <Box args={[1.5, 0.1, 2]} position={[0, 2, 0]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
              <meshStandardMaterial 
                color={hoveredStructure === 'solar' ? "#70e1ff" : structures.solar.color} 
                metalness={0.8} 
                roughness={0.2} 
              />
            </Box>
            <Cylinder args={[0.1, 0.1, 4]} position={[0, 1, 0]} castShadow receiveShadow>
              <meshStandardMaterial color={hoveredStructure === 'solar' ? "#70e1ff" : structures.solar.color} />
            </Cylinder>
          </group>
        ))}
      </group>

      {/* Observatory */}
      <group 
        position={[4, 0, 0]}
        onClick={() => onSelectStructure('observatory')}
        onPointerOver={() => handlePointerOver('observatory')}
        onPointerOut={handlePointerOut}
        scale={[getStructureScale(structures.observatory.level), getStructureScale(structures.observatory.level), getStructureScale(structures.observatory.level)]}
      >
        <Cylinder args={[1.5, 2, 2]} position={[0, 1, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} />
        </Cylinder>
        <Sphere args={[1.2, 16, 16, 0, Math.PI]} position={[0, 2, 0]} rotation={[0, 0, Math.PI]} castShadow receiveShadow>
          <meshStandardMaterial 
            color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} 
            metalness={0.5} 
            roughness={0.2} 
          />
        </Sphere>
        <Cylinder args={[0.2, 0.2, 3]} position={[1.5, 1.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} />
        </Cylinder>
        <Box args={[1, 0.5, 0.5]} position={[2.2, 2.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} />
        </Box>
        {structures.observatory.level >= 3 && (
          <Sphere args={[0.8, 16, 16]} position={[-1.5, 1.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} />
          </Sphere>
        )}
        {structures.observatory.level >= 5 && (
          <Cylinder args={[0.2, 0.2, 4]} position={[-1.5, 3.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'observatory' ? "#70e1ff" : structures.observatory.color} />
          </Cylinder>
        )}
      </group>

      {/* Launch Pad */}
      <group 
        position={[8, 0, 0]}
        onClick={() => onSelectStructure('launch')}
        onPointerOver={() => handlePointerOver('launch')}
        onPointerOut={handlePointerOut}
        scale={[getStructureScale(structures.launch.level), getStructureScale(structures.launch.level), getStructureScale(structures.launch.level)]}
      >
        <Cylinder args={[2, 2, 0.5]} position={[0, 0.25, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'launch' ? "#70e1ff" : structures.launch.color} />
        </Cylinder>
        <Cylinder args={[0.3, 0.5, 5]} position={[0, 2.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial 
            color={hoveredStructure === 'launch' ? "#70e1ff" : structures.launch.color} 
            metalness={0.5} 
            roughness={0.2} 
          />
        </Cylinder>
        <Box args={[0.8, 0.2, 0.8]} position={[0, 4.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={hoveredStructure === 'launch' ? "#70e1ff" : structures.launch.color} />
        </Box>
        {structures.launch.level >= 3 && (
          <Cylinder args={[1, 1, 2]} position={[-1.5, 1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'launch' ? "#70e1ff" : structures.launch.color} />
          </Cylinder>
        )}
        {structures.launch.level >= 5 && (
          <Box args={[3, 0.5, 3]} position={[0, 0.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={hoveredStructure === 'launch' ? "#70e1ff" : structures.launch.color} />
          </Box>
        )}
      </group>
    </group>
  )
}

