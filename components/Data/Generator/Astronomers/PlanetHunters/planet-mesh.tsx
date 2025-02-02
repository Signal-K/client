'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface PlanetMeshProps {
  stats: {
    mass: number
    radius: number
    density: number
    type: 'terrestrial' | 'gaseous'
  }
}

export function PlanetMesh({ stats }: PlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  
  const { material, cloudMaterial } = useMemo(() => {
    const shader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x000000) },
        color2: { value: new THREE.Color(0x000000) },
        color3: { value: new THREE.Color(0x000000) },
        waterLevel: { value: 0.0 },
        distortAmount: { value: stats.type === 'gaseous' ? 0.05 : 0.135 },
        noiseScale: { value: stats.type === 'gaseous' ? 2.0 : 1.0 },
        density: { value: stats.density },
        mass: { value: stats.mass },
        isGaseous: { value: stats.type === 'gaseous' ? 1.0 : 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vElevation;
        
        uniform float time;
        uniform float distortAmount;
        uniform float noiseScale;
        uniform float density;
        uniform float isGaseous;
        
        // Simplex 3D Noise
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          
          vec3 pos = position;
          float elevation = 0.0;
          
          if (isGaseous > 0.5) {
            // Gas giant features
            float bands = sin(pos.y * 10.0 + time * 0.1) * 0.5;
            float storms = snoise(pos * vec3(2.0, 8.0, 2.0) + time * 0.15) * 0.5;
            float cyclones = snoise(pos * vec3(4.0, 1.0, 4.0) + time * 0.05) * 0.25;
            
            elevation = mix(bands, storms, 0.5) + cyclones;
            elevation *= distortAmount;
          } else {
            // Terrestrial features
            float baseNoise = snoise(pos * noiseScale + time * 0.05);
            float landmass = smoothstep(-0.3, 0.3, baseNoise); // Increased land area
            
            // Adjust land coverage based on density
            float landCoverage = smoothstep(3.5, 7.0, density);
            landmass = smoothstep(1.0 - landCoverage * 2.0, 1.0, landmass); // Double the land coverage
            
            float mountains = pow(max(0.0, baseNoise), 3.0) * 1.5; // Reduced mountain height and coverage
            float plains = snoise(pos * noiseScale * 2.0 + time * 0.1) * 0.1;
            float craters = -abs(snoise(pos * noiseScale * 4.0)) * 0.05;
            
            elevation = mix(0.0, mountains + plains + craters, landmass);
            elevation *= distortAmount;
          }
          
          vElevation = elevation;
          
          // Apply displacement
          pos += normal * elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vElevation;
        
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float time;
        uniform float waterLevel;
        uniform float density;
        uniform float mass;
        uniform float isGaseous;
        uniform vec3 sunDirection;
        
        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        // Simplex 3D Noise (for color variation)
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vec3 normal = normalize(vNormal);
          float lightIntensity = dot(normal, sunDirection) * 0.5 + 0.5;
          float fresnel = pow(1.0 + dot(normal, normalize(vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 color;
          
          if (isGaseous > 0.5) {
            // Gas giant coloring
            float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
            float storms = smoothstep(0.4, 0.6, snoise(vPosition * 2.0 + time * 0.15));
            float cyclones = smoothstep(0.3, 0.7, snoise(vPosition * vec3(4.0, 1.0, 4.0) + time * 0.05));
            
            color = mix(color1, color2, bands);
            color = mix(color, color3, storms * 0.5);
            color = mix(color, vec3(1.0), cyclones * 0.2);
            
            // Add subtle atmospheric glow
            float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(0.1, 0.15, 0.25) * atmosphere;
          } else {
            // Terrestrial coloring
            float baseNoise = snoise(vPosition * 2.0);
            float landmass = smoothstep(-0.3, 0.3, baseNoise);

            // Adjust land coverage based on density
            float landCoverage = smoothstep(3.5, 7.0, density);
            landmass = smoothstep(1.0 - landCoverage * 2.0, 1.0, landmass);

            if (landmass < 0.5) {
              // Ocean
              color = mix(color1 * 0.8, color1, smoothstep(0.0, 0.5, landmass));
              // Add subtle water shine
              float shine = pow(fresnel, 4.0) * 0.3;
              color += vec3(shine);
            } else {
              // Land
              float mountainHeight = smoothstep(0.7, 1.0, landmass);
              float beachArea = smoothstep(0.5, 0.55, landmass);
              
              vec3 beachColor = mix(color1, color2, 0.7);
              vec3 groundColor = color2;
              vec3 mountainColor = color3;
              
              color = mix(beachColor, groundColor, beachArea);
              color = mix(color, mountainColor, mountainHeight);
              
              // Add texture variation
              float textureNoise = snoise(vPosition * 10.0) * 0.1;
              color += vec3(textureNoise);
            }
          }
          
          // Apply lighting with reduced contrast
          color = mix(color, color * lightIntensity, 0.7);
          
          // Add rim lighting for better visibility on the dark side
          float rimLight = pow(1.0 - max(0.0, dot(normal, normalize(vec3(0.0, 0.0, 1.0)))), 4.0);
          color += rimLight * vec3(0.1, 0.1, 0.2);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    })

    // Set colors based on planet type and density
    if (stats.type === 'gaseous') {
      if (stats.density > 1.5) {
        shader.uniforms.color1.value.setStyle('#7B3F00')
        shader.uniforms.color2.value.setStyle('#D2691E')
        shader.uniforms.color3.value.setStyle('#FFB90F')
      } else {
        shader.uniforms.color1.value.setStyle('#A7C6DA')
        shader.uniforms.color2.value.setStyle('#E6E6FA')
        shader.uniforms.color3.value.setStyle('#B8E2F2')
      }
    } else {
      shader.uniforms.color1.value.setStyle('#1E4D6B') // Deep water
      shader.uniforms.color2.value.setStyle('#CD853F') // Lowland
      shader.uniforms.color3.value.setStyle('#8B4513') // Highland
    }

    const cloudShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        planetRadius: { value: stats.radius },
      },
      vertexShader: `
        uniform float time;
        uniform float planetRadius;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normal;
          
          // Slightly larger than the planet
          vec3 pos = position * (planetRadius + 0.01);
          
          // Add some movement to the clouds
          pos += normal * sin(pos.x * 10.0 + time * 0.5) * 0.005;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          
          // Create cloud-like patterns
          float noise = rand(uv + time * 0.1) * 0.5 + 0.5;
          noise += rand(uv * 2.0 - time * 0.05) * 0.25;
          noise += rand(uv * 4.0 + time * 0.1) * 0.125;
          noise /= 1.875;
          
          // Add some variation to cloud density
          noise = smoothstep(0.4, 0.6, noise);
          
          // Create holes in the clouds
          float holes = rand(uv * 8.0 - time * 0.02);
          noise *= smoothstep(0.4, 0.6, holes);
          
          // Fade out at the edges for a more natural look
          float fadeEdges = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          noise *= fadeEdges;
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, noise * 0.3);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    return { material: shader, cloudMaterial: cloudShader }
  }, [stats.type, stats.density, stats.mass, stats.radius])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.elapsedTime * 0.5
      material.uniforms.sunDirection.value.set(
        Math.sin(state.clock.elapsedTime * 0.2),
        0.5,
        Math.cos(state.clock.elapsedTime * 0.2)
      ).normalize()
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005
      cloudMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <Sphere 
        ref={meshRef} 
        args={[1, 128, 128]} 
        scale={stats.radius}
      >
        <primitive object={material} attach="material" />
      </Sphere>
      {stats.type === 'terrestrial' && stats.mass >= 0.3 && (
        <Sphere ref={cloudRef} args={[1.01, 64, 64]} scale={stats.radius}>
          <primitive object={cloudMaterial} attach="material" />
        </Sphere>
      )}
    </>
  )
}
import { determineLiquidType } from "@/utils/planet-physics"

interface PlanetMeshLiquidProps {
  stats: {
    mass: number
    radius: number
    density: number
    type: "terrestrial" | "gaseous"
    temperature: number
  }
}

export function PlanetMeshWithLiquid({ stats }: PlanetMeshLiquidProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)

  const { material, cloudMaterial } = useMemo(() => {
    const liquidInfo = determineLiquidType(stats.temperature)
    const shader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x000000) },
        color2: { value: new THREE.Color(0x000000) },
        color3: { value: new THREE.Color(0x000000) },
        waterLevel: { value: 0.0 },
        distortAmount: { value: stats.type === "gaseous" ? 0.05 : 0.135 },
        noiseScale: { value: stats.type === "gaseous" ? 2.0 : 1.0 },
        density: { value: stats.density },
        mass: { value: stats.mass },
        isGaseous: { value: stats.type === "gaseous" ? 1.0 : 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
        liquidColor: { value: new THREE.Color(liquidInfo.color) },
        hasLiquid: { value: stats.type === "terrestrial" && liquidInfo.type !== "none" ? 1.0 : 0.0 },
        temperature: { value: stats.temperature },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vElevation;
        
        uniform float time;
        uniform float distortAmount;
        uniform float noiseScale;
        uniform float density;
        uniform float isGaseous;
        
        // Simplex 3D Noise
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          
          vec3 pos = position;
          float elevation = 0.0;
          
          if (isGaseous > 0.5) {
            // Gas giant features
            float bands = sin(pos.y * 10.0 + time * 0.1) * 0.5;
            float storms = snoise(pos * vec3(2.0, 8.0, 2.0) + time * 0.15) * 0.5;
            float cyclones = snoise(pos * vec3(4.0, 1.0, 4.0) + time * 0.05) * 0.25;
            
            elevation = mix(bands, storms, 0.5) + cyclones;
            elevation *= distortAmount;
          } else {
            // Terrestrial features
            float baseNoise = snoise(pos * noiseScale + time * 0.05);
            float landmass = smoothstep(-0.3, 0.3, baseNoise); // Increased land area
            
            // Adjust land coverage based on density
            float landCoverage = smoothstep(3.5, 7.0, density);
            landmass = smoothstep(1.0 - landCoverage * 2.0, 1.0, landmass); // Double the land coverage
            
            float mountains = pow(max(0.0, baseNoise), 3.0) * 1.5; // Reduced mountain height and coverage
            float plains = snoise(pos * noiseScale * 2.0 + time * 0.1) * 0.1;
            float craters = -abs(snoise(pos * noiseScale * 4.0)) * 0.05;
            
            elevation = mix(0.0, mountains + plains + craters, landmass);
            elevation *= distortAmount;
          }
          
          vElevation = elevation;
          
          // Apply displacement
          pos += normal * elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vElevation;
        
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float time;
        uniform float waterLevel;
        uniform float density;
        uniform float mass;
        uniform float isGaseous;
        uniform vec3 sunDirection;
        uniform vec3 liquidColor;
        uniform float hasLiquid;
        uniform float temperature;
        
        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        // Simplex 3D Noise (for color variation)
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy) );
          vec3 x0 =   v - i + dot(i, C.xxx) ;

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min( g.xyz, l.zxy );
          vec3 i2 = max( g.xyz, l.zxy );

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0 ); 
          vec4 p = permute( permute( permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4( x.xy, y.xy );
          vec4 b1 = vec4( x.zw, y.zw );

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

          vec3 p0 = vec3(a0.xy,h.x);
          vec3 p1 = vec3(a0.zw,h.y);
          vec3 p2 = vec3(a1.xy,h.z);
          vec3 p3 = vec3(a1.zw,h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
        }

        vec3 getLiquidColor(float temp) {
          vec3 waterColor = vec3(0.0, 0.4, 0.8);
          vec3 methaneColor = vec3(1.0, 0.85, 0.0);
          vec3 nitrogenColor = vec3(0.56, 0.93, 0.56);

          if (temp >= 273.0 && temp <= 373.0) {
            return mix(waterColor, methaneColor, smoothstep(273.0, 373.0, temp));
          } else if (temp >= 91.0 && temp <= 112.0) {
            return methaneColor;
          } else if (temp >= 195.0 && temp <= 240.0) {
            return mix(nitrogenColor, waterColor, smoothstep(195.0, 240.0, temp));
          }
          return vec3(0.5); // Default gray for no liquid
        }

        void main() {
          vec3 normal = normalize(vNormal);
          float lightIntensity = dot(normal, sunDirection) * 0.5 + 0.5;
          float fresnel = pow(1.0 + dot(normal, normalize(vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 color;
          
          if (isGaseous > 0.5) {
            // Gas giant coloring - unchanged
            float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
            float storms = smoothstep(0.4, 0.6, snoise(vPosition * 2.0 + time * 0.15));
            float cyclones = smoothstep(0.3, 0.7, snoise(vPosition * vec3(4.0, 1.0, 4.0) + time * 0.05));
            
            color = mix(color1, color2, bands);
            color = mix(color, color3, storms * 0.5);
            color = mix(color, vec3(1.0), cyclones * 0.2);
            
            float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(0.1, 0.15, 0.25) * atmosphere;
          } else {
            // Terrestrial coloring
            float baseNoise = snoise(vPosition * 2.0);
            float landmass = smoothstep(-0.3, 0.3, baseNoise);
            float landCoverage = smoothstep(3.5, 7.0, density);
            landmass = smoothstep(1.0 - landCoverage * 2.0, 1.0, landmass);

            // Use elevation to determine liquid placement
            float elevationFactor = smoothstep(-0.1, 0.1, vElevation);
            
            if (landmass < 0.5 && hasLiquid > 0.5 && elevationFactor < 0.5) {
              // Liquid in low areas only
              float liquidDepth = 1.0 - elevationFactor;
              vec3 currentLiquidColor = getLiquidColor(temperature);
              color = mix(currentLiquidColor * 0.8, currentLiquidColor, liquidDepth);
              float shine = pow(fresnel, 4.0) * 0.3;
              color += vec3(shine);
            } else {
              // Land
              float mountainHeight = smoothstep(0.7, 1.0, landmass);
              float beachArea = smoothstep(0.5, 0.55, landmass);
              
              vec3 beachColor = mix(color1, color2, 0.7);
              vec3 groundColor = color2;
              vec3 mountainColor = color3;
              
              color = mix(beachColor, groundColor, beachArea);
              color = mix(color, mountainColor, mountainHeight);
              
              float textureNoise = snoise(vPosition * 10.0) * 0.1;
              color += vec3(textureNoise);
            }
          }
          
          // Apply lighting with reduced contrast
          color = mix(color, color * lightIntensity, 0.7);
          
          // Add rim lighting for better visibility on the dark side
          float rimLight = pow(1.0 - max(0.0, dot(normal, normalize(vec3(0.0, 0.0, 1.0)))), 4.0);
          color += rimLight * vec3(0.1, 0.1, 0.2);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    })

    // Set colors based on planet type and density
    if (stats.type === "gaseous") {
      if (stats.density > 1.5) {
        shader.uniforms.color1.value.setStyle("#7B3F00")
        shader.uniforms.color2.value.setStyle("#D2691E")
        shader.uniforms.color3.value.setStyle("#FFB90F")
      } else {
        shader.uniforms.color1.value.setStyle("#A7C6DA")
        shader.uniforms.color2.value.setStyle("#E6E6FA")
        shader.uniforms.color3.value.setStyle("#B8E2F2")
      }
    } else {
      shader.uniforms.color1.value.setStyle("#1E4D6B") // Deep water
      shader.uniforms.color2.value.setStyle("#CD853F") // Lowland
      shader.uniforms.color3.value.setStyle("#8B4513") // Highland
    }

    const cloudShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        planetRadius: { value: stats.radius },
      },
      vertexShader: `
        uniform float time;
        uniform float planetRadius;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normal;
          
          // Slightly larger than the planet
          vec3 pos = position * (planetRadius + 0.01);
          
          // Add some movement to the clouds
          pos += normal * sin(pos.x * 10.0 + time * 0.5) * 0.005;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          
          // Create cloud-like patterns
          float noise = rand(uv + time * 0.1) * 0.5 + 0.5;
          noise += rand(uv * 2.0 - time * 0.05) * 0.25;
          noise += rand(uv * 4.0 + time * 0.1) * 0.125;
          noise /= 1.875;
          
          // Add some variation to cloud density
          noise = smoothstep(0.4, 0.6, noise);
          
          // Create holes in the clouds
          float holes = rand(uv * 8.0 - time * 0.02);
          noise *= smoothstep(0.4, 0.6, holes);
          
          // Fade out at the edges for a more natural look
          float fadeEdges = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          noise *= fadeEdges;
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, noise * 0.3);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    return { material: shader, cloudMaterial: cloudShader }
  }, [stats.type, stats.density, stats.mass, stats.radius, stats.temperature])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.elapsedTime * 0.5
      material.uniforms.sunDirection.value
        .set(Math.sin(state.clock.elapsedTime * 0.2), 0.5, Math.cos(state.clock.elapsedTime * 0.2))
        .normalize()
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005
      cloudMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <Sphere ref={meshRef} args={[1, 128, 128]} scale={stats.radius}>
        <primitive object={material} attach="material" />
      </Sphere>
      {stats.type === "terrestrial" && stats.mass >= 0.3 && (
        <Sphere ref={cloudRef} args={[1.01, 64, 64]} scale={stats.radius}>
          <primitive object={cloudMaterial} attach="material" />
        </Sphere>
      )}
    </>
  )
}
