"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

interface SimplePlanetMeshProps {
  stats: {
    mass: number
    radius: number
    density: number
  }
}

export function SimplePlanetMesh({ stats }: SimplePlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x4b0082) },
        density: { value: stats.density },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float density;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
          float lightIntensity = max(0.1, dot(vNormal, lightDirection));
          
          vec3 adjustedColor = mix(color, vec3(1.0), density * 0.2);
          gl_FragColor = vec4(adjustedColor * lightIntensity, 1.0);
        }
      `,
    })
  }, [stats.density])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={stats.radius}>
      <primitive object={material} attach="material" />
    </Sphere>
  )
}

