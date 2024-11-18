"use client"

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import { Button } from "@/components/ui/button"
import { Settings, Play } from 'lucide-react'

const terrainVertexShader = `
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vElevation = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const terrainFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uLowColor;
  uniform vec3 uHighColor;
  uniform float uBands;

  void main() {
    float bandedElevation = floor(vElevation * uBands) / uBands;
    vec3 color = mix(uLowColor, uHighColor, bandedElevation);
    gl_FragColor = vec4(color, 1.0);
  }
`

interface TerrainConfig {
  seed: number;
  heightScale: number;
  lowColor: string;
  highColor: string;
  topographicBands: number;
};

export function Ignore(){
  return (
    <></>
  )
}

// const Terrain = ({ config }: { config: TerrainConfig }) => {
//   const mesh = useRef()
//   const prng = useMemo(() => alea(config.seed), [config.seed])
//   const noise2D = useMemo(() => createNoise2D(prng), [prng])

//   const geometry = useMemo(() => {
//     const geo = new THREE.PlaneGeometry(20, 20, 200, 200)
//     const positions = geo.attributes.position.array

//     for (let i = 0; i < positions.length; i += 3) {
//       const x = positions[i]
//       const y = positions[i + 1]
//       const noise = noise2D(x * 0.05, y * 0.05)
//       positions[i + 2] = noise * config.heightScale
//     }

//     geo.computeVertexNormals()
//     return geo
//   }, [noise2D, config.heightScale, config.seed])

//   const material = useMemo(() => {
//     return new THREE.ShaderMaterial({
//       vertexShader: terrainVertexShader,
//       fragmentShader: terrainFragmentShader,
//       uniforms: {
//         uLowColor: { value: new THREE.Color(config.lowColor) },
//         uHighColor: { value: new THREE.Color(config.highColor) },
//         uBands: { value: config.topographicBands },
//       },
//     })
//   }, [config.lowColor, config.highColor, config.topographicBands])

//   useFrame(() => {
//     if (mesh.current) {
//       mesh.current.material.uniforms.uLowColor.value.set(config.lowColor)
//       mesh.current.material.uniforms.uHighColor.value.set(config.highColor)
//       mesh.current.material.uniforms.uBands.value = config.topographicBands
//     }
//   })

//   return <mesh ref={mesh} geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} />
// }

// const Deposit = ({ position, name, selected }) => {
//   const mesh = useRef<THREE.Mesh>(null);

//   useFrame(({ camera }) => {
//     if (mesh.current) {
//       mesh.current.lookAt(camera.position)
//     }
//   })

//   return (
//     <group position={position}>
//       <mesh ref={mesh}>
//         <sphereGeometry args={[0.3, 32, 32]} />
//         <meshStandardMaterial color={selected ? "#5FCBC3" : "#FFE3BA"} />
//       </mesh>
//       <Html>
//         <div className="bg-white px-2 py-1 rounded text-sm">{name}</div>
//       </Html>
//     </group>
//   )
// }

// const Rover = ({ position }) => {
//   return (
//     <mesh position={position}>
//       <boxGeometry args={[0.2, 0.2, 0.2]} />
//       <meshStandardMaterial color="#2C4F64" />
//     </mesh>
//   )
// }

// const Map = ({ config, deposits, roverPosition, selectedDeposit }) => {
//   return (
//     <>
//       <Terrain config={config} />
//       {deposits.map((deposit) => (
//         <Deposit 
//           key={deposit.id} 
//           position={[deposit.position.x / 10 - 10, deposit.position.y / 10 - 10, 0.5]} 
//           name={deposit.name}
//           selected={selectedDeposit?.id === deposit.id}
//         />
//       ))}
//       {roverPosition && (
//         <Rover position={[roverPosition.x / 10 - 10, roverPosition.y / 10 - 10, 0.5]} />
//       )}
//     </>
//   )
// }

// const CameraController = () => {
//   const { camera } = useThree()
//   useEffect(() => {
//     camera.position.set(0, 15, 0.01)
//     camera.lookAt(0, 0, 0)
//   }, [camera])

//   return null
// }

// type MineralDeposit = {
//   id: string
//   name: string
//   amount: number
//   position: { x: number; y: number }
// }

// type Props = {
//   deposits: MineralDeposit[]
//   roverPosition: { x: number; y: number } | null
//   selectedDeposit: MineralDeposit | null
// }

// export function TerrainMap({ deposits = [], roverPosition, selectedDeposit }: Props) {
//   const [config, setConfig] = useState({
//     seed: 42,
//     heightScale: 1,
//     topographicBands: 20,
//     lowColor: '#1e3a8a',
//     highColor: '#60a5fa',
//   })
//   const [showConfig, setShowConfig] = useState(false)

//   const handleGenerate = () => {
//     setConfig({ ...config, seed: Math.floor(Math.random() * 1000) })
//   }

//   return (
//     <div className="relative w-full h-[400px]">
//       <div className="absolute top-2 left-2 z-10 flex space-x-2">
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={() => setShowConfig(!showConfig)}
//           aria-label="Edit Configuration"
//         >
//           <Settings className="h-4 w-4" />
//         </Button>
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={handleGenerate}
//           aria-label="Generate New Map"
//         >
//           <Play className="h-4 w-4" />
//         </Button>
//       </div>
//       <Canvas>
//         <PerspectiveCamera makeDefault fov={75} position={[0, 15, 0.01]} />
//         <CameraController />
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <Map  config={config} deposits={deposits} roverPosition={roverPosition} selectedDeposit={selectedDeposit} />
//         <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
//       </Canvas>
//     </div>
//   )
// }