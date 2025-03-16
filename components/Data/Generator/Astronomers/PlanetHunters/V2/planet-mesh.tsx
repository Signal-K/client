"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { determineLiquidType } from "@/utils/planet-physics";
import {
  type CloudCategory,
  CloudCategories,
  hexToRgb,
  getCloudPattern,
  getPatternFunctionName,
} from "@/utils/cloud-types";

interface PlanetStats {
  mass: number
  radius: number
  density: number
  type: "terrestrial" | "gaseous"
  temperature: number
  atmosphereStrength: number
  cloudCount: number
  waterHeight: number
  surfaceRoughness: number
  biomeFactor: number
  cloudContribution: number
  terrainVariation: "flat" | "moderate" | "chaotic"
  orbitalPeriod: number
  terrainErosion: number
  plateTectonics: number
  // soilType: string;
  biomassLevel: number
  waterLevel: number
  salinity: number
  subsurfaceWater: number
  atmosphericDensity: number
  weatherVariability: number
  stormFrequency: number
  volcanicActivity: number
  biome: string
  cloudTypes: string[]
  cloudDensity: number
  surfaceDeposits?: string[]
}

interface PlanetMeshProps {
  stats: PlanetStats
  terrainHeight?: number
  classificationId?: string
  author?: string
}

export function PlanetMesh({ stats, terrainHeight = 5 }: PlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Convert string cloud types to CloudCategory types
  const cloudCategories = useMemo(() => {
    return (stats.cloudTypes || []).filter((type) => Object.keys(CloudCategories).includes(type)) as CloudCategory[]
  }, [stats.cloudTypes])

  // If no valid cloud types, use CloudyRegion as default
  const effectiveCloudTypes = cloudCategories.length > 0 ? cloudCategories : (["CloudyRegion"] as CloudCategory[])

  const { material, cloudMaterial, atmosphereMaterial } = useMemo(() => {
    const liquidInfo = determineLiquidType(stats.temperature)

    // Generate cloud pattern functions for each cloud type
    const cloudPatternFunctions = effectiveCloudTypes.map(getCloudPattern).join("\n")

    // Get cloud colors for each type
    const cloudColors = effectiveCloudTypes.map((type) => {
      const color = CloudCategories[type]?.color || "#FFFFFF"
      return hexToRgb(color)
    })

    // Create uniform arrays for cloud colors
    const cloudColorsFlat = cloudColors.flat()

    const shader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterHeight: { value: stats.waterHeight },
        distortAmount: { value: stats.type === "gaseous" ? 0.15 : 0.05 },
        noiseScale: { value: stats.type === "gaseous" ? 2.0 : 1.0 },
        density: { value: stats.density },
        mass: { value: stats.mass },
        isGaseous: { value: stats.type === "gaseous" ? 1.0 : 0.0 },
        isOceanicWorld: { value: stats.biome === "Oceanic World" ? 1.0 : 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
        liquidColor: { value: new THREE.Color(liquidInfo.color) },
        hasLiquid: { value: stats.type === "terrestrial" && liquidInfo.type !== "none" ? 1.0 : 0.0 },
        temperature: { value: stats.temperature },
        surfaceRoughness: { value: stats.surfaceRoughness },
        radius: { value: stats.radius },
        terrainHeight: { value: terrainHeight },
        biomeFactor: { value: stats.biomeFactor },
        cloudContribution: { value: stats.cloudContribution },
        terrainVariation: {
          value: stats.terrainVariation === "flat" ? 0.0 : stats.terrainVariation === "chaotic" ? 1.0 : 0.5,
        },
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
        uniform float mass;
        uniform float surfaceRoughness;
        uniform float terrainHeight;
        uniform float biomeFactor;
        uniform float cloudContribution;
        uniform float terrainVariation;
        uniform float isOceanicWorld;
        
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

        float ridgedNoise(vec3 p) {
          float n = abs(snoise(p));
          n = 1.0 - n; // invert the ridges
          n = n * n;   // sharpen the ridges
          return n;
        }

        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          
          vec3 pos = position;
          float elevation = 0.0;
          
          // Base noise
          float baseNoise = snoise(pos * noiseScale + time * 0.05);
          
          if (isGaseous > 0.5) {
            // Gas giant features
            float bands = sin(pos.y * 10.0 + time * 0.1) * 0.5;
            float storms = snoise(pos * vec3(2.0, 8.0, 2.0) + time * 0.15) * 0.5;
            float cyclones = snoise(pos * vec3(4.0, 1.0, 4.0) + time * 0.05) * 0.25;
            
            elevation = mix(bands, storms, 0.5) + cyclones;
          } else {
            // Terrestrial features
            float landmass = smoothstep(-0.3, 0.3, baseNoise);
            
            // Adjust land coverage based on mass and density
            float landCoverage = smoothstep(0.5, 2.0, mass) * smoothstep(3.5, 7.0, density);
            
            // For oceanic worlds, reduce terrain height significantly
            if (isOceanicWorld > 0.5) {
              elevation *= 0.2; // Reduce elevation for oceanic worlds
            }
            
            landmass = smoothstep(1.0 - landCoverage, 1.0, landmass);
            
            float mountains = pow(max(0.0, baseNoise), 3.0) * 1.5;
            float plains = snoise(pos * noiseScale * 2.0 + time * 0.1) * 0.1;
            
            // Add craters
            float craters = 0.0;
            for (int i = 0; i < 5; i++) {
              vec3 craterPos = vec3(sin(float(i) * 1.618) * 100.0, cos(float(i) * 1.618) * 100.0, sin(float(i) * 1.618 * 0.5) * 100.0);
              float crater = length(pos - normalize(craterPos)) * 10.0;
              crater = 1.0 - smoothstep(0.0, 0.2 + float(i) * 0.05, crater);
              craters -= crater * 0.1;
            }
            
            // Add ridges
            float ridges = ridgedNoise(pos * 5.0) * 0.2;
            
            // Add volcanoes
            float volcanoes = 0.0;
            for (int i = 0; i < 3; i++) {
              vec3 volcanoPos = vec3(sin(float(i) * 2.618) * 100.0, cos(float(i) * 2.618) * 100.0, sin(float(i) * 2.618 * 0.5) * 100.0);
              float volcano = 1.0 - length(pos - normalize(volcanoPos)) * 10.0;
              volcano = max(0.0, volcano);
              volcanoes += pow(volcano, 5.0) * 0.5;
            }
            
            // Add more bumpiness
            float bumpiness = snoise(pos * 20.0) * 0.02;
            
            elevation = mix(0.0, mountains + plains + craters + ridges + volcanoes + bumpiness, landmass);
          }
          
          // Apply terrain height and variation
          elevation *= distortAmount * surfaceRoughness * terrainHeight * (1.0 + terrainVariation * snoise(pos * 10.0));
          
          // Apply biome factor
          elevation *= biomeFactor;
          
          // For oceanic worlds, reduce elevation further
          if (isOceanicWorld > 0.5) {
            elevation *= 0.3;
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
        
        uniform float time;
        uniform float waterHeight;
        uniform float density;
        uniform float mass;
        uniform float isGaseous;
        uniform float isOceanicWorld;
        uniform vec3 sunDirection;
        uniform vec3 liquidColor;
        uniform float hasLiquid;
        uniform float temperature;
        uniform float radius;
        uniform float terrainHeight;
        uniform float biomeFactor;
        uniform float cloudContribution;
        
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
          vec3 waterColor = vec3(0.0, 0.2, 0.5);
          vec3 methaneColor = vec3(0.2, 0.4, 0.6);
          vec3 nitrogenColor = vec3(0.4, 0.6, 0.8);

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
            // Gas giant coloring
            float bands = sin(vPosition.y * 10.0 + time * 0.1) * 0.5 + 0.5;
            float storms = smoothstep(0.4, 0.6, snoise(vPosition * 2.0 + time * 0.15));
            float cyclones = smoothstep(0.3, 0.7, snoise(vPosition * vec3(4.0, 1.0, 4.0) + time * 0.05));
            
            vec3 baseColor = mix(vec3(0.6, 0.4, 0.2), vec3(0.8, 0.6, 0.4), bands);
            vec3 stormColor = vec3(1.0, 0.9, 0.8);
            vec3 cycloneColor = vec3(0.9, 0.7, 0.5);
            
            color = mix(baseColor, stormColor, storms * 0.5);
            color = mix(color, cycloneColor, cyclones * 0.2);
            
            float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(0.1, 0.15, 0.25) * atmosphere;
            
            // Add translucency
            float translucency = pow(1.0 - abs(dot(normal, sunDirection)), 4.0) * 0.2;
            color += vec3(0.8, 0.6, 0.4) * translucency;
          } else {
            // Terrestrial coloring
            float baseNoise = snoise(vPosition * 2.0);
            float landmass = smoothstep(-0.3, 0.3, baseNoise);
            float landCoverage = smoothstep(0.5, 2.0, mass) * smoothstep(3.5, 7.0, density);
            
            // For oceanic worlds, reduce land coverage to near zero
            float oceanicWaterHeight = waterHeight;
            if (isOceanicWorld > 0.5) {
              landmass = smoothstep(0.9, 1.0, landmass); // Only the highest peaks might show
              oceanicWaterHeight = 0.95; // Set water height very high for oceanic worlds
            } else {
              landmass = smoothstep(1.0 - landCoverage, 1.0, landmass);
            }

            // Use elevation to determine biomes and textures
            float elevationFactor = smoothstep(-0.1, 0.1, vElevation);
            
            vec3 waterColor = vec3(0.0, 0.2, 0.5);
            vec3 lowlandColor = vec3(0.76, 0.70, 0.50); // Sandy color
            vec3 highlandColor = vec3(0.55, 0.27, 0.07); // Brown
            vec3 mountainColor = vec3(0.4, 0.2, 0.1); // Dark brown
            vec3 polarColor = vec3(0.95, 0.95, 1.0); // Ice caps

            if (landmass < 0.5 && hasLiquid > 0.5 && elevationFactor < oceanicWaterHeight) {
              // Liquid areas
              float liquidDepth = 1.0 - elevationFactor / oceanicWaterHeight;
              vec3 currentLiquidColor = getLiquidColor(temperature);
              color = mix(currentLiquidColor * 0.8, currentLiquidColor, liquidDepth);
              float shine = pow(fresnel, 4.0) * 0.3;
              color += vec3(shine);
            } else {
              // Land areas
              color = mix(waterColor, lowlandColor, smoothstep(oceanicWaterHeight - 0.02, oceanicWaterHeight + 0.02, elevationFactor));
              color = mix(color, highlandColor, smoothstep(0.4, 0.6, elevationFactor * terrainHeight));
              color = mix(color, mountainColor, smoothstep(0.7, 0.9, elevationFactor * terrainHeight));

              // Add polar ice caps
              color = mix(color, polarColor, smoothstep(0.8, 1.0, abs(vPosition.y)));
              
              // Add some texture variation
              float textureNoise = snoise(vPosition * 20.0) * 0.1;
              color += vec3(textureNoise);

              // Apply biome factor
              color = mix(color, color * biomeFactor, 0.5);

              // Check if the planet is Earth-like
              bool isEarthLike = abs(radius - 1.0) < 0.2 && temperature > 273.0 && temperature < 313.0;
              
              if (isEarthLike) {
                lowlandColor = vec3(0.76, 0.70, 0.50); // Sandy color
                highlandColor = vec3(0.8, 0.7, 0.3); // Yellow-brown
                mountainColor = vec3(0.5, 0.3, 0.1); // Dark brown
                
                color = mix(vec3(0.0, 0.2, 0.5), vec3(0.0, 0.4, 0.8), elevationFactor / oceanicWaterHeight);
                if (elevationFactor > oceanicWaterHeight) {
                  float landHeight = (elevationFactor - oceanicWaterHeight) / (1.0 - oceanicWaterHeight);
                  color = mix(lowlandColor, highlandColor, smoothstep(0.2, 0.6, landHeight));
                  color = mix(color, mountainColor, smoothstep(0.6, 0.8, landHeight));
                }
              }
            }
          }
          
          // Apply lighting with reduced contrast
          color = mix(color, color * lightIntensity, 0.7);
          
          // Add rim lighting for better visibility on the dark side
          float rimLight = pow(1.0 - max(0.0, dot(normal, normalize(vec3(0.0, 0.0, 1.0)))), 4.0);
          color += rimLight * vec3(0.1, 0.1, 0.2);
          
          // Apply cloud contribution
          color = mix(color, vec3(1.0), cloudContribution * 0.2);
          
          gl_FragColor = vec4(color, isGaseous > 0.5 ? 0.9 : 1.0);
        }
      `,
      transparent: true,
    })

    // Create enhanced cloud shader with support for different cloud types
    const cloudShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        planetRadius: { value: stats.radius },
        cloudCount: { value: stats.cloudCount },
        cloudContribution: { value: stats.cloudContribution },
        cloudDensity: { value: stats.cloudDensity || 0.5 },
        cloudColors: { value: cloudColorsFlat },
        cloudTypesCount: { value: effectiveCloudTypes.length },
      },
      vertexShader: `
        uniform float time;
        uniform float planetRadius;
        uniform float cloudCount;
        uniform float cloudContribution;
        uniform float cloudDensity;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          
          // Position clouds just above the planet surface
          vec3 pos = position * (planetRadius + 0.01);
          
          // Add some movement to the clouds
          float cloudHeight = 0.01 + cloudDensity * 0.02;
          pos += normal * cloudHeight;
          
          // Add some variation based on position and time
          pos += normal * sin(position.x * 10.0 + time * 0.2) * 0.005;
          pos += normal * cos(position.z * 8.0 + time * 0.15) * 0.005;
          
          // Adjust cloud distribution based on cloudCount and cloudContribution
          float cloudFactor = smoothstep(0.0, 100.0, cloudCount) * cloudContribution;
          pos += normal * (1.0 - cloudFactor) * 0.01;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float cloudCount;
        uniform float cloudContribution;
        uniform float cloudDensity;
        uniform float cloudTypesCount;
        uniform float cloudColors[30]; // Support up to 10 cloud types (3 values per color)
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        float rand(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // Cloud pattern functions for different cloud types
        ${cloudPatternFunctions}

        void main() {
          vec2 uv = vUv;
          float totalPattern = 0.0;
          vec3 cloudColor = vec3(1.0);
          
          // Apply different cloud patterns based on cloud types
          ${effectiveCloudTypes
            .map(
              (type, index) => `
            // ${CloudCategories[type].name} pattern
            float pattern${index} = ${getPatternFunctionName(type)}(uv, time);
            totalPattern += pattern${index} * (1.0 / cloudTypesCount);
            
            // Apply cloud color with increased saturation and brightness
            vec3 color${index} = vec3(
              cloudColors[${index * 3}], 
              cloudColors[${index * 3 + 1}], 
              cloudColors[${index * 3 + 2}]
            );
            // Enhance color saturation and brightness
            color${index} = color${index} * 1.5;
            cloudColor = mix(cloudColor, color${index}, pattern${index} * (1.0 / cloudTypesCount) * 3.0);
          `,
            )
            .join("\n")}
          
          // Base cloud noise
          float noise = rand(uv + time * 0.1) * 0.3 + 0.7;
          
          // Combine patterns with base noise
          float cloudPattern = totalPattern * noise;
          
          // Create holes in the clouds
          float holes = rand(uv * 8.0 - time * 0.02);
          cloudPattern *= smoothstep(0.3, 0.7, holes);
          
          // Fade out at the edges for a more natural look
          float fadeEdges = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          cloudPattern *= fadeEdges;
          
          // Adjust cloud opacity based on cloudCount, cloudContribution and cloudDensity
          float cloudOpacity = smoothstep(0.0, 100.0, cloudCount) * cloudContribution * cloudDensity * 1.5;

          // Apply lighting
          vec3 lightDir = normalize(vec3(1.0, 0.5, 1.0));
          float lightIntensity = max(0.6, dot(vNormal, lightDir));
          cloudColor *= lightIntensity;

          // Add some depth and volume to clouds with increased contrast
          float depth = pow(cloudPattern, 1.2) * cloudDensity * 1.5;

          gl_FragColor = vec4(cloudColor, cloudPattern * cloudOpacity * depth);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    // Create atmosphere material with enhanced visuals
    const atmosphereShader = new THREE.ShaderMaterial({
      uniforms: {
        atmosphereStrength: { value: stats.atmosphereStrength },
        liquidColor: { value: new THREE.Color(liquidInfo.color) },
        isGaseous: { value: stats.type === "gaseous" ? 1.0 : 0.0 },
        time: { value: 0 },
        cloudColors: { value: cloudColorsFlat },
        cloudTypesCount: { value: effectiveCloudTypes.length },
      },
      vertexShader: `
        uniform float atmosphereStrength;
        uniform float time;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          vPosition = position;
          
          // Make atmosphere size based on strength
          float atmosphereSize = 1.0 + atmosphereStrength * 0.15;
          vec3 pos = position * atmosphereSize;
          
          // Add some subtle movement to the atmosphere
          pos += normal * sin(position.y * 5.0 + time * 0.1) * 0.01;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float atmosphereStrength;
        uniform vec3 liquidColor;
        uniform float isGaseous;
        uniform float time;
        uniform float cloudTypesCount;
        uniform float cloudColors[30]; // Support up to 10 cloud types (3 values per color)
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Calculate atmosphere intensity based on viewing angle
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          
          // Base atmosphere color with increased saturation
          vec3 atmosphereColor = mix(vec3(0.4, 0.7, 1.2), liquidColor * 1.2, 0.3);
          
          // For gas giants, use more vibrant coloring
          if (isGaseous > 0.5) {
            atmosphereColor = mix(vec3(0.9, 0.7, 0.5), vec3(0.5, 0.3, 0.2), intensity);
          }
          
          // Add more pronounced color variation from cloud types
          vec3 cloudInfluence = vec3(0.0);
          
          // Mix in colors from cloud types with increased influence
          for (int i = 0; i < 10; i++) {
            if (float(i) >= cloudTypesCount) break;
            
            vec3 cloudTypeColor = vec3(
              cloudColors[i * 3], 
              cloudColors[i * 3 + 1], 
              cloudColors[i * 3 + 2]
            );
            
            // Add stronger influence from each cloud type
            cloudInfluence += cloudTypeColor * 0.2;
          }
          
          // Mix cloud colors into atmosphere with increased influence
          atmosphereColor = mix(atmosphereColor, cloudInfluence, 0.4);
          
          // Add more dynamic variation based on position
          float variation = sin(vPosition.x * 12.0 + vPosition.y * 10.0 + time * 0.3) * 0.15 + 0.95;
          atmosphereColor *= variation;
          
          // Add some swirling patterns for more visual interest
          float swirl = sin(vPosition.x * 5.0 + vPosition.y * 7.0 + time * 0.2) * 
                 cos(vPosition.y * 3.0 + vPosition.z * 4.0 + time * 0.15) * 0.1;
          atmosphereColor += vec3(swirl, swirl * 0.7, swirl * 0.5);
          
          // Calculate final opacity with increased base value
          float opacity = intensity * atmosphereStrength * (isGaseous > 0.5 ? 0.9 : 1.2);
          
          // Add more pronounced pulsing effect
          opacity *= 0.8 + sin(time * 0.3) * 0.15;
          
          gl_FragColor = vec4(atmosphereColor, opacity);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { material: shader, cloudMaterial: cloudShader, atmosphereMaterial: atmosphereShader }
  }, [
    stats.type,
    stats.density,
    stats.mass,
    stats.radius,
    stats.temperature,
    stats.atmosphereStrength,
    stats.cloudCount,
    stats.waterHeight,
    stats.surfaceRoughness,
    terrainHeight,
    stats.biomeFactor,
    stats.cloudContribution,
    stats.terrainVariation,
    stats.cloudDensity,
    effectiveCloudTypes,
    stats.biome,
  ])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.elapsedTime * 0.5
      material.uniforms.sunDirection.value
        .set(Math.sin(state.clock.elapsedTime * 0.2), 0.5, Math.cos(state.clock.elapsedTime * 0.2))
        .normalize()
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0015 // Slightly faster than planet rotation
      cloudMaterial.uniforms.time.value = state.clock.elapsedTime
      cloudMaterial.uniforms.cloudCount.value = stats.cloudCount
      cloudMaterial.uniforms.cloudContribution.value = stats.cloudContribution
      cloudMaterial.uniforms.cloudDensity.value = stats.cloudDensity || 0.5
    }
    if (atmosphereRef.current) {
      atmosphereMaterial.uniforms.atmosphereStrength.value = stats.atmosphereStrength
      atmosphereMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <>
      <Sphere ref={meshRef} args={[1, 128, 128]} scale={stats.radius}>
        <primitive object={material} attach="material" />
      </Sphere>
      {stats.cloudCount > 0 && (
        <Sphere ref={cloudRef} args={[1.01, 64, 64]} scale={stats.radius}>
          <primitive object={cloudMaterial} attach="material" />
        </Sphere>
      )}
      {stats.atmosphereStrength > 0 && (
        <Sphere ref={atmosphereRef} args={[1.1, 64, 64]} scale={stats.radius}>
          <primitive object={atmosphereMaterial} attach="material" />
        </Sphere>
      )}
    </>
  );
};