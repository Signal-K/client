"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetStats } from "@/lib/planet-physics";
import { getBiomeColors } from "@/lib/biome-data";

interface PlanetShaderProps {
  planetStats: PlanetStats;
};

export function PlanetShader({ planetStats }: PlanetShaderProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const { planetMaterial, atmosphereMaterial, cloudsMaterial } = useMemo(() => {
    // Get biome colors
    const biomeColors = planetStats.customColors || getBiomeColors(planetStats.biome || "Rocky Highlands");

    // Create planet shader material
    const planetShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        oceanColor: { value: new THREE.Color(biomeColors.oceanFloor || "#1E4D6B") },
        beachColor: { value: new THREE.Color(biomeColors.beach || "#8D6E63") },
        landColor: { value: new THREE.Color(biomeColors.regular || "#A1887F") },
        mountainColor: { value: new THREE.Color(biomeColors.mountain || "#D7CCC8") },
        waterLevel: { value: planetStats.waterLevel || 0.65 },
        surfaceRoughness: { value: planetStats.surfaceRoughness || 0.5 },
        mountainHeight: { value: planetStats.mountainHeight || 0.6 },
        isGaseous: { value: planetStats.mass > 7 || planetStats.radius > 2.5 ? 1.0 : 0.0 },
        soilType: {
          value: ["rocky", "sandy", "volcanic", "organic", "dusty", "frozen", "muddy"].indexOf(
            planetStats.soilType || "rocky",
          ),
        },
        soilTexture: {
          value: ["smooth", "rough", "cracked", "layered", "porous", "grainy", "crystalline"].indexOf(
            planetStats.soilTexture || "rough",
          ),
        },
        liquidEnabled: { value: planetStats.liquidEnabled !== false ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vElevation;
        
        uniform float time;
        uniform float surfaceRoughness;
        uniform float mountainHeight;
        uniform float isGaseous;
        uniform int soilType;
        uniform int soilTexture;
        
        // Simplex 3D Noise
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0); 
          vec4 p = permute(permute(permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 1.0/7.0;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

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
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        // Fractal Brownian Motion with reduced octaves for less fuzziness
        float fbm(vec3 p, int octaves) {
          float value = 0.0;
          float amplitude = 1.0;
          float frequency = 1.0;
          float persistence = 0.5;
          
          for (int i = 0; i < octaves; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= persistence;
            frequency *= 2.0;
          }
          
          return value;
        }

        // Soil texture function with reduced intensity
        float getSoilTexture(vec3 pos, int textureType) {
          float detail = 0.0;
          
          // Scale and depth based on texture type
          float scale = 1.0;
          float depth = 0.05;
          
          if (textureType == 0) { // smooth
            scale = 5.0; depth = 0.01;
          } else if (textureType == 1) { // rough
            scale = 15.0; depth = 0.05;
          } else if (textureType == 2) { // cracked
            scale = 20.0; depth = 0.08;
            float crack1 = snoise(pos * scale * 2.0);
            float crack2 = snoise(pos * scale * 5.0);
            return (abs(crack1) < 0.1 ? depth * 1.5 : 0.0) + (abs(crack2) < 0.05 ? depth * 0.8 : 0.0);
          } else if (textureType == 3) { // layered
            scale = 12.0; depth = 0.04;
            float layer = snoise(pos * scale * 0.5);
            return sin(layer * 20.0) * depth * 0.8;
          } else if (textureType == 4) { // porous
            scale = 25.0; depth = 0.06;
            float pore = snoise(pos * scale * 4.0);
            return pore > 0.8 ? depth * 1.5 : 0.0;
          } else if (textureType == 5) { // grainy
            scale = 30.0; depth = 0.03;
            float grain1 = snoise(pos * scale * 8.0);
            float grain2 = snoise(pos * scale * 12.0);
            return grain1 * grain2 * depth;
          } else if (textureType == 6) { // crystalline
            scale = 18.0; depth = 0.07;
            float crystal = snoise(pos * scale * 3.0);
            return (crystal > 0.7 || crystal < -0.7) ? depth * 1.2 : 0.0;
          }
          
          // Default noise pattern
          float defaultNoise = snoise(pos * scale);
          return defaultNoise * depth * 0.5;
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
            elevation *= 0.05; // Reduced distortion for gas giants
          } else {
            // Terrestrial features - use FBM with fewer octaves for less fuzziness
            float baseNoise = fbm(pos * surfaceRoughness + time * 0.01, 5);
          
            // Apply mountain height
            baseNoise *= mountainHeight;
            
            // Apply soil texture with reduced intensity
            float textureDetail = getSoilTexture(pos, soilTexture) * 0.7;
            
            // Adjust texture based on soil type
            if (soilType == 2) { // volcanic
              textureDetail *= 1.5;
            } else if (soilType == 1) { // sandy
              textureDetail *= 0.7;
            }
            
            elevation = baseNoise - textureDetail;
            elevation *= 0.08; // Scale for terrestrial planets
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
        
        uniform vec3 oceanColor;
        uniform vec3 beachColor;
        uniform vec3 landColor;
        uniform vec3 mountainColor;
        uniform float time;
        uniform float waterLevel;
        uniform float isGaseous;
        uniform float liquidEnabled;
        uniform int soilType;
        
        // Simplex 3D Noise
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

        float snoise(vec3 v){ 
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1. + 3.0 * C.xxx;

          i = mod(i, 289.0); 
          vec4 p = permute(permute(permute( 
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 1.0/7.0;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

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
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 normal = normalize(vNormal);

          // Simple ambient occlusion based on elevation
          float ao = 1.0 - abs(vElevation) * 2.0;
          ao = max(0.4, ao);
          
          // Static light direction for consistent lighting
          vec3 lightDir = normalize(vec3(0.0, 0.3, 1.0));
          
          // Basic lighting calculation - fixed intensity
          float lightFactor = 0.8;
        
          vec3 color;
        
          if (isGaseous > 0.5) {
            // Gas giant coloring
            float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
            float storms = smoothstep(0.4, 0.6, snoise(vPosition * 2.0 + time * 0.15));
            float cyclones = smoothstep(0.3, 0.7, snoise(vPosition * vec3(4.0, 1.0, 4.0) + time * 0.05));
          
            // Use ocean and land colors for gas giants
            color = mix(oceanColor, landColor, bands);
            color = mix(color, mountainColor, storms * 0.5);
            color = mix(color, vec3(1.0), cyclones * 0.2);
          
            // Add subtle atmospheric glow
            float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(0.1, 0.15, 0.25) * atmosphere;
          } else {
            // Terrestrial coloring based on elevation
            float normalizedElevation = (vElevation + 0.08) / 0.16; // Normalize to 0-1 range
          
            if (liquidEnabled > 0.5 && normalizedElevation < waterLevel) {
              // Water areas
              float depth = (waterLevel - normalizedElevation) / waterLevel;
              color = mix(beachColor, oceanColor, depth * 2.0);
            
              // Add water effects
              float waterNoise = snoise(vPosition * 20.0 + time * 0.1) * 0.02;
              color += vec3(waterNoise);
            
              // Add water shine
              float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
              float shine = pow(fresnel, 4.0) * 0.3;
              color += vec3(shine);
            } else {
              // Land areas
              if (normalizedElevation < waterLevel + 0.05) {
                // Beach/shore
                color = beachColor;
              } else if (normalizedElevation < waterLevel + 0.3) {
                // Regular terrain
                float t = (normalizedElevation - (waterLevel + 0.05)) / 0.25;
                color = mix(beachColor, landColor, t);
              } else {
                // Mountains
                float t = (normalizedElevation - (waterLevel + 0.3)) / 0.7;
                color = mix(landColor, mountainColor, t);
              }
            
              // Add soil type variations with reduced intensity
              float soilNoise = snoise(vPosition * 10.0) * 0.05;
            
              // Different soil type effects
              if (soilType == 0) { // rocky
                color *= 0.95 + soilNoise;
              } else if (soilType == 1) { // sandy
                color = mix(color, beachColor, 0.15);
                color += vec3(soilNoise * 0.15);
              } else if (soilType == 2) { // volcanic
                color *= 0.85;
                if (soilNoise > 0.03) color += vec3(0.08, 0.0, 0.0);
              } else if (soilType == 3) { // organic
                color = mix(color, vec3(0.2, 0.5, 0.2), 0.25);
              } else if (soilType == 4) { // dusty
                color = mix(color, vec3(0.6, 0.5, 0.4), 0.25);
              } else if (soilType == 5) { // frozen
                color = mix(color, vec3(0.8, 0.9, 1.0), 0.3);
                color += vec3(soilNoise * 0.2);
              } else if (soilType == 6) { // muddy
                color = mix(color, vec3(0.3, 0.2, 0.1), 0.3);
              }
            }
          }
          
          // Apply ambient occlusion
          color *= ao;
          
          // Apply fixed light intensity
          color *= lightFactor;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    // Create atmosphere shader
    const atmosphereShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x87ceeb) },
        strength: { value: planetStats.atmosphereStrength || 0.8 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float strength;
        
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          float intensity = pow(0.7 - abs(dot(vNormal, vec3(0, 0, 1))), 1.5);
          vec3 atmosphereColor = color * intensity * strength;
          gl_FragColor = vec4(atmosphereColor, intensity * strength * 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })

    // Create cloud shader
    const cloudShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        cloudCount: { value: planetStats.cloudCount || 30 },
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normal;
          
          // Add some movement to the clouds
          vec3 pos = position;
          pos += normal * sin(pos.x * 10.0 + time * 0.5) * 0.005;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float cloudCount;
        varying vec2 vUv;
        varying vec3 vNormal;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 uv = vUv;
          
          // Create cloud-like patterns
          float noise = rand(uv + time * 0.1) * 0.5 + 0.5;
          noise += rand(uv * 2.0 - time * 0.05) * 0.25;
          noise += rand(uv * 4.0 + time * 0.1) * 0.125;
          noise /= 1.875;
          
          // Adjust cloud coverage based on cloudCount
          float coverage = cloudCount / 100.0;
          noise = smoothstep(0.5 - coverage * 0.4, 0.6, noise);
          
          // Create holes in the clouds
          float holes = rand(uv * 8.0 - time * 0.02);
          noise *= smoothstep(0.4, 0.6, holes);
          
          // Fade out at the edges for a more natural look
          float fadeEdges = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          noise *= fadeEdges;
          
          gl_FragColor = vec4(1.0, 1.0, 1.0, noise * 0.5);
        }
      `,
      transparent: true,
      depthWrite: false,
    })

    return {
      planetMaterial: planetShader,
      atmosphereMaterial: atmosphereShader,
      cloudsMaterial: cloudShader,
    }
  }, [planetStats])

  // Update uniforms on each frame
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
      planetMaterial.uniforms.time.value = state.clock.elapsedTime
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
      atmosphereMaterial.uniforms.time.value = state.clock.elapsedTime
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0012
      cloudsMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  const isGaseous = planetStats.mass > 7 || planetStats.radius > 2.5
  const showClouds = !isGaseous && planetStats.cloudCount && planetStats.cloudCount > 0

  return (
    <group>
      {/* Doubled resolution from 128 to 256 segments */}
      <Sphere ref={planetRef} args={[1, 256, 256]} scale={planetStats.radius}>
        <primitive object={planetMaterial} attach="material" />
      </Sphere>

      {/* Increased atmosphere resolution */}
      <Sphere ref={atmosphereRef} args={[1.05, 128, 128]} scale={planetStats.radius}>
        <primitive object={atmosphereMaterial} attach="material" />
      </Sphere>

      {showClouds && (
        /* Increased clouds resolution */
        <Sphere ref={cloudsRef} args={[1.02, 128, 128]} scale={planetStats.radius}>
          <primitive object={cloudsMaterial} attach="material" />
        </Sphere>
      )}
    </group>
  );
};