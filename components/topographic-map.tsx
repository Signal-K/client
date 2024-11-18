import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, X } from 'lucide-react'
import { Slider } from "@/components/ui/slider";
import { ThreeEvent } from "@react-three/fiber";

// Shader code remains the same
const topographicVertexShader = `
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vElevation = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const topographicFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uBaseColor;
  uniform vec3 uContourColor;
  uniform float uBands;
  uniform float uContourWidth;

  void main() {
    float elevation = vElevation;
    float bandedElevation = floor(elevation * uBands) / uBands;
    float nextBand = floor(elevation * uBands + 1.0) / uBands;
    float mixFactor = smoothstep(bandedElevation, nextBand, elevation);
    
    float contourLine = 1.0 - smoothstep(0.0, uContourWidth, abs(mixFactor - 0.5));
    
    vec3 finalColor = mix(uBaseColor, uContourColor, contourLine * 0.5);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

const atmosphericFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uLowColor;
  uniform vec3 uMidColor;
  uniform vec3 uHighColor;
  uniform float uBands;
  uniform float uContourWidth;

  void main() {
    float elevation = vElevation;
    
    vec3 color;
    if (elevation < 0.33) {
      color = mix(uLowColor, uMidColor, elevation * 3.0);
    } else if (elevation < 0.66) {
      color = mix(uMidColor, uHighColor, (elevation - 0.33) * 3.0);
    } else {
      color = uHighColor;
    }
    
    float bandedElevation = floor(elevation * uBands) / uBands;
    float nextBand = floor(elevation * uBands + 1.0) / uBands;
    float mixFactor = smoothstep(bandedElevation, nextBand, elevation);
    
    float contourLine = 1.0 - smoothstep(0.0, uContourWidth, abs(mixFactor - 0.5));
    
    color = mix(color, vec3(0.0), contourLine * 0.5);
    
    gl_FragColor = vec4(color, 1.0);
  }
`

interface Landmark {
  position: [number, number, number]
  name: string
  imageUrl: string
  description: string
}

const createStarShape = () => {
  const shape = new THREE.Shape()
  const points = 5
  const innerRadius = 0.2
  const outerRadius = 0.5

  for (let i = 0; i < points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const x = Math.sin(angle) * radius
    const y = Math.cos(angle) * radius
    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }
  shape.closePath()
  return shape
}

type LandmarkMarkerProps = {
  position: [number, number, number];
  onClick: (e: ThreeEvent<MouseEvent>) => void; // Use ThreeEvent<MouseEvent> here
};

const LandmarkMarker: React.FC<LandmarkMarkerProps> = ({ position, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const starShape = useMemo(() => createStarShape(), []);

  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh position={position} ref={meshRef} onClick={onClick}>
      <shapeGeometry args={[starShape]} />
      <meshBasicMaterial color="limegreen" side={THREE.DoubleSide} />
    </mesh>
  );
};

interface TerrainConfig {
  seed: string
  heightScale: number
  viewMode: 'topographic' | 'atmospheric'
  baseColor: string
  contourColor: string
  lowColor: string
  midColor: string
  highColor: string
  topographicBands: number
}

interface TerrainProps {
  config: TerrainConfig
}

const terrainConfig: TerrainConfig = {
  seed: "example-seed",
  heightScale: 5,
  viewMode: "topographic",
  baseColor: "#F5F5DC",
  contourColor: "#000000",
  lowColor: "#0000ff",
  midColor: "#00ff00",
  highColor: "#ff0000",
  topographicBands: 10,
};

const Terrain: React.FC<TerrainProps> = ({ config }) => {
  // Explicitly type the mesh ref as THREE.Mesh
  const mesh = useRef<THREE.Mesh>(null)

  // Memoized PRNG and noise generator
  const prng = useMemo(() => alea(config.seed), [config.seed])
  const noise2D = useMemo(() => createNoise2D(prng), [prng])

  // Create the geometry with noise-based elevation
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 200, 200)
    const positions = geo.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const noise = noise2D(x * 0.05, y * 0.05)
      positions[i + 2] = noise * config.heightScale
    }

    geo.computeVertexNormals()
    return geo
  }, [noise2D, config.heightScale])

  // Create the ShaderMaterial
  const material = useMemo(() => {
    const shader =
      config.viewMode === 'topographic'
        ? {
            vertex: topographicVertexShader,
            fragment: topographicFragmentShader,
          }
        : {
            vertex: topographicVertexShader,
            fragment: atmosphericFragmentShader,
          }

    return new THREE.ShaderMaterial({
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment,
      uniforms: {
        uBaseColor: { value: new THREE.Color(config.baseColor) },
        uContourColor: { value: new THREE.Color(config.contourColor) },
        uLowColor: { value: new THREE.Color(config.lowColor) },
        uMidColor: { value: new THREE.Color(config.midColor) },
        uHighColor: { value: new THREE.Color(config.highColor) },
        uBands: { value: config.topographicBands },
        uContourWidth: { value: 0.1 },
      },
    })
  }, [config])

  // Update the ShaderMaterial uniforms on each frame
  useFrame(() => {
    if (mesh.current) {
      const mat = mesh.current.material as THREE.ShaderMaterial
      mat.uniforms.uBaseColor.value.set(config.baseColor)
      mat.uniforms.uContourColor.value.set(config.contourColor)
      mat.uniforms.uLowColor.value.set(config.lowColor)
      mat.uniforms.uMidColor.value.set(config.midColor)
      mat.uniforms.uHighColor.value.set(config.highColor)
      mat.uniforms.uBands.value = config.topographicBands
    }
  })

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}

interface MapSceneProps {
  config: unknown
  onSelectLandmark: (landmark: Landmark) => void
}

const MapScene: React.FC<MapSceneProps> = ({ config, onSelectLandmark }) => {
  const landmarks: Landmark[] = [
    {
      position: [3, 3, 1],
      name: "Mount Oberon",
      imageUrl: "/placeholder.svg?height=300&width=400",
      description:
        "The highest peak in the region, known for its unique crystalline formations.",
    },
    {
      position: [-2, -2, 0.5],
      name: "Little Oberon",
      imageUrl: "/placeholder.svg?height=300&width=400",
      description:
        "A smaller peak with abundant vegetation and rare mineral deposits.",
    },
  ];

  return (
    <>
      <Terrain config={terrainConfig} />
      {landmarks.map((landmark, index) => (
        <LandmarkMarker
          key={index}
          position={landmark.position}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelectLandmark(landmark);
          }}
        />
      ))}
    </>
  );
};

interface LandmarkModalProps {
  landmark: Landmark | null;  
  onClose: () => void;  
}

const LandmarkModal: React.FC<LandmarkModalProps> = ({ landmark, onClose }) => {
  if (!landmark) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-lg m-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{landmark.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <img
              src={landmark.imageUrl}
              alt={landmark.name}
              className="w-full h-60 object-cover rounded-md"
            />
            <p>{landmark.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// const ConfigPanel = ({ config, setConfig, onClose }) => {
//   return (
//     <Card className="absolute top-16 left-4 w-80 p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="font-bold">Configuration</h3>
//         <Button variant="ghost" size="icon" onClick={onClose}>
//           <X className="h-4 w-4" />
//         </Button>
//       </div>
//       <div className="space-y-4">
//         <div>
//           <Label>View Mode</Label>
//           <Tabs value={config.viewMode} onValueChange={(value) => setConfig({ ...config, viewMode: value })}>
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="topographic">Topographic</TabsTrigger>
//               <TabsTrigger value="atmospheric">Atmospheric</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>
//         {config.viewMode === 'topographic' && (
//           <>
//             <div>
//               <Label htmlFor="baseColor">Base Color</Label>
//               <Input
//                 id="baseColor"
//                 type="color"
//                 value={config.baseColor}
//                 onChange={(e) => setConfig({ ...config, baseColor: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label htmlFor="contourColor">Contour Color</Label>
//               <Input
//                 id="contourColor"
//                 type="color"
//                 value={config.contourColor}
//                 onChange={(e) => setConfig({ ...config, contourColor: e.target.value })}
//               />
//             </div>
//           </>
//         )}
//         {config.viewMode === 'atmospheric' && (
//           <>
//             <div>
//               <Label htmlFor="lowColor">Low Color</Label>
//               <Input
//                 id="lowColor"
//                 type="color"
//                 value={config.lowColor}
//                 onChange={(e) => setConfig({ ...config, lowColor: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label htmlFor="midColor">Mid Color</Label>
//               <Input
//                 id="midColor"
//                 type="color"
//                 value={config.midColor}
//                 onChange={(e) => setConfig({ ...config, midColor: e.target.value })}
//               />
//             </div>
//             <div>
//               <Label htmlFor="highColor">High Color</Label>
//               <Input
//                 id="highColor"
//                 type="color"
//                 value={config.highColor}
//                 onChange={(e) => setConfig({ ...config, highColor: e.target.value })}
//               />
//             </div>
//           </>
//         )}
//         <div>
//           <Label htmlFor="topographicBands">Topographic Bands</Label>
//           <Slider
//             id="topographicBands"
//             min={1}
//             max={50}
//             step={1}
//             value={[config.topographicBands]}
//             onValueChange={(value) => setConfig({ ...config, topographicBands: value[0] })}
//           />
//         </div>
//       </div>
//     </Card>
//   )
// }

export function TopographicMap() {
  const [config, setConfig] = useState({
    seed: 42,
    heightScale: 1,
    topographicBands: 40,
    viewMode: 'topographic',
    baseColor: '#F5F5DC', // Beige
    contourColor: '#8B4513', // Saddle Brown
    lowColor: '#0000FF', // Blue
    midColor: '#8B4513', // Green
    highColor: '#FF0000', // Red
  });
  const [showConfig, setShowConfig] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [key, setKey] = useState(0);

  const handleConfigChange = (newConfig: typeof config) => {
    setConfig(newConfig);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute top-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowConfig(!showConfig)}
          aria-label="Toggle Configuration"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {showConfig && (
        <div className="absolute top-12 left-4 z-20 bg-white p-4 shadow-lg">
          <button onClick={() => handleConfigChange({ ...config, seed: config.seed + 1 })}>
            Increase Seed
          </button>
          <button onClick={() => setShowConfig(false)}>Close</button>
        </div>
      )}

      <Canvas
        className="w-full h-full"
        orthographic
        camera={{
          position: [0, 10, 0],
          zoom: 30,
          near: 0.1,
          far: 100,
        }}
        key={key}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <MapScene config={config} onSelectLandmark={setSelectedLandmark} />
        <OrbitControls enableRotate={false} enablePan enableZoom />
      </Canvas>

      {selectedLandmark && (
        <LandmarkModal
          landmark={selectedLandmark}
          onClose={() => setSelectedLandmark(null)}
        />
      )}
    </div>
  );
}