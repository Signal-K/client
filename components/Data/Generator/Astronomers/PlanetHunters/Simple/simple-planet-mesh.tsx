"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface SimplePlanetMeshProps {
  stats: {
    mass: number;
    radius: number;
    density?: number;
    type?: "terrestrial" | "gaseous" | undefined;
  }; 
};

export function SimplePlanetMesh({ stats }: SimplePlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0xffe3ba) }, // Light sand color
        color2: { value: new THREE.Color(0xff695d) }, // Reddish accent color
        color3: { value: new THREE.Color(0x2c4f64) }, // Dark blue-gray color
        color4: { value: new THREE.Color(0x8b4513) }, // Saddle brown for more variety
        color5: { value: new THREE.Color(0x228b22) }, // Forest green for Earth-like planets
        density: { value: stats.density },
        mass: { value: stats.mass },
        isGaseous: { value: stats.type === "gaseous" ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vElevation;
        
        uniform float time;
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

        float ridgedNoise(vec3 p) {
          float n = abs(snoise(p));
          n = 1.0 - n; // invert the ridges
          n = n * n;   // sharpen the ridges
          return n;
        }

        void main() {
          vUv = uv;
          vNormal = normal;
          
          vec3 pos = position;
          float noiseScale = isGaseous > 0.5 ? 2.0 : 1.0;
          float distortAmount = isGaseous > 0.5 ? 0.15 : 0.05;
          
          float elevation = 0.0;
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
            float mountains = pow(max(0.0, baseNoise), 3.0) * 1.5;
            float plains = snoise(pos * noiseScale * 2.0 + time * 0.1) * 0.1;
            float ridges = ridgedNoise(pos * 5.0) * 0.2;
            
            // Add craters
            float craters = 0.0;
            for (int i = 0; i < 3; i++) {
              vec3 craterPos = vec3(sin(float(i) * 1.618) * 100.0, cos(float(i) * 1.618) * 100.0, sin(float(i) * 1.618 * 0.5) * 100.0);
              float crater = length(pos - normalize(craterPos)) * 10.0;
              crater = 1.0 - smoothstep(0.0, 0.2 + float(i) * 0.05, crater);
              craters -= crater * 0.1;
            }
            
            elevation = mix(0.0, mountains + plains + ridges + craters, landmass);
          }
          
          elevation *= distortAmount;
          vElevation = elevation;
          
          // Apply displacement
          pos += normal * elevation;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform vec3 color5;
        uniform float density;
        uniform float mass;
        uniform float isGaseous;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vElevation;
        
        // Simplex noise function (keep existing implementation)
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
          vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
          float lightIntensity = max(0.1, dot(vNormal, lightDirection));
          
          vec3 color;
          if (isGaseous > 0.5) {
            // Gas giant coloring
            float bands = sin(vNormal.y * 10.0) * 0.5 + 0.5;
            float storms = smoothstep(0.4, 0.6, vElevation);
            
            color = mix(color1, color2, bands);
            color = mix(color, color3, storms * 0.5);
            
            // Add more color variation
            float colorVariation = snoise(vNormal * 5.0 + time * 0.1);
            color = mix(color, color4, colorVariation * 0.3);
            
            // Adjust color based on density (Jupiter-like vs Saturn-like)
            color = mix(color, vec3(0.9, 0.7, 0.5), smoothstep(0.5, 1.5, density));
          } else {
            // Terrestrial coloring
            float landmass = smoothstep(-0.3, 0.3, vElevation);
            
            vec3 waterColor = color3; // Dark blue-gray for water
            vec3 lowlandColor = color1; // Light sand color for lowlands
            vec3 highlandColor = color2; // Reddish accent color for highlands
            vec3 mountainColor = color4; // Saddle brown for mountains
            
            // Add some variation based on latitude
            float latitudeFactor = abs(vNormal.y);
            vec3 polarColor = mix(waterColor, vec3(0.9, 0.95, 1.0), 0.5); // Blueish white for polar regions
            
            color = mix(waterColor, lowlandColor, landmass);
            color = mix(color, highlandColor, smoothstep(0.2, 0.6, vElevation));
            color = mix(color, mountainColor, smoothstep(0.6, 0.8, vElevation));
            
            // Add some green for potentially habitable planets
            if (mass > 0.5 && mass < 2.0 && density > 3.0 && density < 6.0) {
              color = mix(color, color5, smoothstep(0.3, 0.5, vElevation) * (1.0 - abs(latitudeFactor)));
            }
            
            // Blend in polar regions
            color = mix(color, polarColor, smoothstep(0.7, 1.0, latitudeFactor));
            
            // Add some noise-based texture
            float textureNoise = snoise(vNormal * 10.0 + time * 0.1) * 0.1;
            color += vec3(textureNoise);
          }
          
          // Apply lighting
          color *= lightIntensity;
          
          // Add a subtle rim lighting effect
          float rimLight = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          color += rimLight * 0.2;
          
          gl_FragColor = vec4(color, isGaseous > 0.5 ? 0.9 : 1.0);
        }
      `,
      transparent: true,
    });
  }, [stats.type, stats.density, stats.mass]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001
      material.uniforms.time.value = state.clock.elapsedTime
    };
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={stats.radius}>
      <primitive object={material} attach="material" />
    </Sphere>
  );
};