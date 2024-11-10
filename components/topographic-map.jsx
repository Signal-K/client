"use client"

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Play, X } from 'lucide-react'

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
    return new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      uniforms: {
        uLowColor: { value: new THREE.Color(config.lowColor) },
        uHighColor: { value: new THREE.Color(config.highColor) },
        uBands: { value: config.topographicBands },
      },
    })
  }, [config.lowColor, config.highColor, config.topographicBands])

  useFrame(() => {
    if (mesh.current) {
      mesh.current.material.uniforms.uLowColor.value.set(config.lowColor)
      mesh.current.material.uniforms.uHighColor.value.set(config.highColor)
      mesh.current.material.uniforms.uBands.value = config.topographicBands
    }
  })

  return <mesh ref={mesh} geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} />
}

const Structure = ({ position }) => {
  const mesh = useRef()

  useFrame(({ camera }) => {
    if (mesh.current) {
      mesh.current.lookAt(camera.position)
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

const Map = ({ config }) => {
  const [structures, setStructures] = useState([])

  useEffect(() => {
    const newStructures = []
    const prng = alea(config.seed + 'structures')
    for (let i = 0; i < config.structureCount; i++) {
      const x = (prng() - 0.5) * 20
      const y = (prng() - 0.5) * 20
      const noise2D = createNoise2D(prng)
      const z = (noise2D(x * 0.05, y * 0.05) + 1) * 0.5 * config.heightScale
      newStructures.push({ position: [x, y, z] })
    }
    setStructures(newStructures)
  }, [config.seed, config.structureCount, config.heightScale])

  return (
    <>
      <Terrain config={config} />
      {structures.map((structure, index) => (
        <Structure key={index} {...structure} />
      ))}
    </>
  )
}

const CameraController = () => {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 15, 0.01)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

const Configurator = ({ config, setConfig, onGenerate, onClose }) => {
  const [configText, setConfigText] = useState(JSON.stringify(config, null, 2))

  const handleExport = () => {
    setConfigText(JSON.stringify(config, null, 2))
  }

  const handleImport = () => {
    try {
      const importedConfig = JSON.parse(configText)
      setConfig(importedConfig)
    } catch (error) {
      console.error("Invalid JSON:", error)
    }
  }

  return (
    <Card className="w-full max-w-sm max-h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Map Configuration</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="seed">Seed</Label>
            <Input
              id="seed"
              type="number"
              value={config.seed}
              onChange={(e) => setConfig({ ...config, seed: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="heightScale">Height Scale</Label>
            <Slider
              id="heightScale"
              min={0.1}
              max={2}
              step={0.1}
              value={[config.heightScale]}
              onValueChange={(value) => setConfig({ ...config, heightScale: value[0] })}
            />
          </div>
          <div>
            <Label htmlFor="topographicBands">Topographic Bands</Label>
            <Slider
              id="topographicBands"
              min={1}
              max={50}
              step={1}
              value={[config.topographicBands]}
              onValueChange={(value) => setConfig({ ...config, topographicBands: value[0] })}
            />
          </div>
          <div>
            <Label htmlFor="structureCount">Structure Count</Label>
            <Slider
              id="structureCount"
              min={1}
              max={50}
              step={1}
              value={[config.structureCount]}
              onValueChange={(value) => setConfig({ ...config, structureCount: value[0] })}
            />
          </div>
          <div>
            <Label htmlFor="lowColor">Low Color</Label>
            <Input
              id="lowColor"
              type="color"
              value={config.lowColor}
              onChange={(e) => setConfig({ ...config, lowColor: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="highColor">High Color</Label>
            <Input
              id="highColor"
              type="color"
              value={config.highColor}
              onChange={(e) => setConfig({ ...config, highColor: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="configText">Import/Export Configuration</Label>
            <Textarea
              id="configText"
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              rows={5}
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleExport}>Export</Button>
            <Button onClick={handleImport}>Import</Button>
          </div>
          <Button onClick={onGenerate} className="w-full">Generate Map</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Component() {
  const [config, setConfig] = useState({
    seed: 42,
    heightScale: 1,
    topographicBands: 20,
    structureCount: 10,
    lowColor: '#1e3a8a',
    highColor: '#60a5fa',
  })
  const [showMap, setShowMap] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  const handleGenerate = () => {
    setShowMap(true)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowConfig(!showConfig)}
          aria-label="Edit Configuration"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleGenerate}
          aria-label="Generate Map"
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
      {showConfig && (
        <div className="absolute inset-4 z-20 flex items-start justify-start">
          <Configurator 
            config={config} 
            setConfig={setConfig} 
            onGenerate={handleGenerate} 
            onClose={() => setShowConfig(false)}
          />
        </div>
      )}
      {showMap && (
        <div className="absolute inset-0 z-30">
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-40"
            onClick={() => setShowMap(false)}
            aria-label="Close Map"
          >
            <X className="h-4 w-4" />
          </Button>
          <Canvas>
            <PerspectiveCamera makeDefault fov={75} position={[0, 15, 0.01]} />
            <CameraController />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Map config={config} />
            <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
          </Canvas>
        </div>
      )}
    </div>
  )
}