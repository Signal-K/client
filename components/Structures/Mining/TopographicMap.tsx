'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, X } from 'lucide-react';

export type MineralDeposit = {
    id: string;
    mineral: string; 
    quantity: number;
    position: { x: number; y: number };
};
 
type Props = {
    deposits: MineralDeposit[];
    roverPosition: { x: number; y: number } | null;
    selectedDeposit: MineralDeposit | null;
};

export function TopographicMap({ deposits = [], roverPosition, selectedDeposit }: Props) { 
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const drawTopographicMap = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#2C3A4A';  // Updated background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
    
          ctx.strokeStyle = '#74859A'; // Updated stroke for topography
          for (let i = 0; i < 10; i++) {
            const [centerX, centerY, radius] = [Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100 + 50];
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
    
          deposits.forEach(deposit => {
            const color = getDepositColor(deposit.mineral);
            drawDeposit(ctx, deposit, color);
          });
        };
    
        const getDepositColor = (name: string) => {
          const colors: Record<string, string> = {
            'Iron': '#FFE3BA',
            'Copper': '#5FCBC3',
            'Gold': '#FFD700',
            'Titanium': '#B0C4DE',
            'Platinum': '#E5E4E2',
          };
          return colors[name] || '#FFE3BA';
        };
    
        const drawDeposit = (ctx: CanvasRenderingContext2D, deposit: MineralDeposit, color: string) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(deposit.position.x, deposit.position.y, Math.sqrt(deposit.quantity) / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#85DDA2';  // Updated stroke
          ctx.lineWidth = 2;
          ctx.stroke();
    
          ctx.fillStyle = '#85DDA2';  // Updated text color
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(deposit.mineral, deposit.position.x, deposit.position.y + Math.sqrt(deposit.quantity) / 2 + 20);
        };
    
        drawTopographicMap();
      }, [deposits]);

      return (
        <div className="relative w-full bg-[#2C3A4A]"> 
          <canvas ref={canvasRef} className="w-full h-full" width={800} height={400} />
          {roverPosition && (
            <motion.div
              className="absolute w-4 h-4 bg-[#5FCBC3] rounded-full" 
              style={{ left: roverPosition.x, top: roverPosition.y }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          {selectedDeposit && (
            <div
              className="absolute w-6 h-6 border-2 border-[#5FCBC3] rounded-full"                      
              style={{ left: selectedDeposit.position.x - 12, top: selectedDeposit.position.y - 12 }}
            />
          )}
        </div>
      );
};

{/* const topographicVertexShader = `
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

const atmosphericVertexShader = `
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vElevation = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphericFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uLowColor;
  uniform vec3 uMidColor;
  uniform vec3 uHighColor;
  
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
    
    gl_FragColor = vec4(color, 1.0);
  }
`

interface Landmark {
  position: [number, number, number]
  name: string
  imageUrl: string
}

interface Road {
  points: [number, number, number][]
  name: string
}

const Landmark = ({ position, name, imageUrl, onClick }: Landmark & { onClick: () => void }) => {
  const textRef = useRef()
  const meshRef = useRef()

  useFrame(({ camera }) => {
    if (textRef.current) {
      textRef.current.lookAt(camera.position)
    }
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer'
          e.stopPropagation()
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default'
          e.stopPropagation()
        }}
      >
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <Text
        ref={textRef}
        position={[0, 0.3, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        {name}
      </Text>
    </group>
  )
}

const Road = ({ points, name }: Road) => {
  return (
    <Line
      points={points}
      color="red"
      lineWidth={2}
      dashed={false}
    />
  )
}

const Terrain = ({ config }) => {
  const mesh = useRef()
  const prng = useMemo(() => alea(config.seed), [config.seed])
  const noise2D = useMemo(() => createNoise2D(prng), [prng])

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 200, 200)
    const positions = geo.attributes.position.array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const noise = noise2D(x * 0.05, y * 0.05)
      positions[i + 2] = noise * config.heightScale
    }

    geo.computeVertexNormals()
    return geo
  }, [noise2D, config.heightScale, config.seed])

  const material = useMemo(() => {
    const shader = config.viewMode === 'topographic' ? 
      { vertex: topographicVertexShader, fragment: topographicFragmentShader } :
      { vertex: atmosphericVertexShader, fragment: atmosphericFragmentShader }

    return new THREE.ShaderMaterial({
      vertexShader: shader.vertex,
      fragmentShader: shader.fragment,
      uniforms: {
        uBaseColor: { value: new THREE.Color(config.baseColor) },
        uContourColor: { value: new THREE.Color(config.contourColor) },
        uBands: { value: config.topographicBands },
        uContourWidth: { value: 0.1 },
        uLowColor: { value: new THREE.Color(config.lowColor) },
        uMidColor: { value: new THREE.Color(config.midColor) },
        uHighColor: { value: new THREE.Color(config.highColor) },
      },
    })
  }, [config])

  useEffect(() => {
    if (mesh.current) {
      mesh.current.material.uniforms.uBaseColor.value.set(config.baseColor)
      mesh.current.material.uniforms.uContourColor.value.set(config.contourColor)
      mesh.current.material.uniforms.uBands.value = config.topographicBands
      mesh.current.material.uniforms.uLowColor.value.set(config.lowColor)
      mesh.current.material.uniforms.uMidColor.value.set(config.midColor)
      mesh.current.material.uniforms.uHighColor.value.set(config.highColor)
    }
  }, [config])

  return <mesh ref={mesh} geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} />
}

const Map = ({ config }) => {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null)
  
  const landmarks: Landmark[] = [
    {
      position: [3, 3, 1],
      name: "Mount Oberon",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
    {
      position: [-2, -2, 0.5],
      name: "Little Oberon",
      imageUrl: "/placeholder.svg?height=300&width=400",
    },
  ]

  const roads: Road[] = [
    {
      points: [
        [-2, -2, 0.5],
        [0, 0, 0.75],
        [3, 3, 1],
      ],
      name: "Mountain Path",
    },
  ]

  return (
    <>
      <Terrain config={config} />
      {landmarks.map((landmark, index) => (
        <Landmark
          key={index}
          {...landmark}
          onClick={() => setSelectedLandmark(landmark)}
        />
      ))}
      {roads.map((road, index) => (
        <Road key={index} {...road} />
      ))}
      {selectedLandmark && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Card className="p-4 max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">{selectedLandmark.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLandmark(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              src={selectedLandmark.imageUrl}
              alt={selectedLandmark.name}
              className="w-full h-auto rounded-lg"
            />
          </Card>
        </div>
      )}
    </>
  )
}

const ConfigPanel = ({ config, setConfig, onClose }) => {
  return (
    <Card className="absolute top-16 left-4 w-80 p-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Configuration</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <Label>View Mode</Label>
          <Tabs value={config.viewMode} onValueChange={(value) => setConfig({ ...config, viewMode: value })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topographic">Topographic</TabsTrigger>
              <TabsTrigger value="atmospheric">Atmospheric</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {config.viewMode === 'topographic' && (
          <>
            <div>
              <Label htmlFor="baseColor">Base Color</Label>
              <Input
                id="baseColor"
                type="color"
                value={config.baseColor}
                onChange={(e) => setConfig({ ...config, baseColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contourColor">Contour Color</Label>
              <Input
                id="contourColor"
                type="color"
                value={config.contourColor}
                onChange={(e) => setConfig({ ...config, contourColor: e.target.value })}
              />
            </div>
          </>
        )}
        {config.viewMode === 'atmospheric' && (
          <>
            <div>
              <Label htmlFor="lowColor">Low Elevation Color</Label>
              <Input
                id="lowColor"
                type="color"
                value={config.lowColor}
                onChange={(e) => setConfig({ ...config, lowColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="midColor">Mid Elevation Color</Label>
              <Input
                id="midColor"
                type="color"
                value={config.midColor}
                onChange={(e) => setConfig({ ...config, midColor: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="highColor">High Elevation Color</Label>
              <Input
                id="highColor"
                type="color"
                value={config.highColor}
                onChange={(e) => setConfig({ ...config, highColor: e.target.value })}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  )
}

export default function Component() {
  const [config, setConfig] = useState({
    seed: 42,
    heightScale: 1,
    topographicBands: 40,
    viewMode: 'topographic',
    baseColor: '#F5F5DC', // Beige
    contourColor: '#8B4513', // Saddle Brown
    lowColor: '#0000FF', // Blue
    midColor: '#00FF00', // Green
    highColor: '#FF0000', // Red
  })
  const [showConfig, setShowConfig] = useState(false)

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10">
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
        <ConfigPanel
          config={config}
          setConfig={setConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
      <Canvas key={JSON.stringify(config)}>
        <PerspectiveCamera makeDefault fov={75} position={[0, 15, 0.01]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Map config={config} />
        <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
      </Canvas>
    </div>
  )
} */}