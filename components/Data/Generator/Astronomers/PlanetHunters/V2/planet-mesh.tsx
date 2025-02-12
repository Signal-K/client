"use client";

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"
import { determineLiquidType } from "@/utils/planet-physics"

interface PlanetMeshProps {
  stats: {
    mass: number
    radius: number
    density: number
    type: "terrestrial" | "gaseous"
    temperature: number
  }
  atmosphereOpacity: number
  showAtmosphere: boolean
  showLiquid: boolean
  atmosphereOffset: number
  splitMeshes: boolean
  storms: number
}

export function PlanetMesh({
  stats,
  atmosphereOpacity,
  showAtmosphere,
  showLiquid,
  atmosphereOffset,
  splitMeshes,
  storms,
}: PlanetMeshProps) {
  const planetRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const stormRef = useRef<THREE.Mesh>(null)

  const { planetMaterial, atmosphereMaterial, stormMaterial } = useMemo(() => {
    const liquidInfo = determineLiquidType(stats.temperature)

    const planetShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x000000) },
        color2: { value: new THREE.Color(0x000000) },
        color3: { value: new THREE.Color(0x000000) },
        waterLevel: { value: 0.0 },
        distortAmount: { value: stats.type === "gaseous" ? 0.05 : 0.2 },
        noiseScale: { value: stats.type === "gaseous" ? 2.0 : 1.5 },
        density: { value: stats.density },
        mass: { value: stats.mass },
        isGaseous: { value: stats.type === "gaseous" ? 1.0 : 0.0 },
        sunDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() },
        liquidColor: { value: new THREE.Color(liquidInfo.color) },
        hasLiquid: { value: stats.type === "terrestrial" && liquidInfo.type !== "none" ? 1.0 : 0.0 },
        temperature: { value: stats.temperature },
        showLiquid: { value: showLiquid ? 1.0 : 0.0 },
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
            float landmass = smoothstep(-0.3, 0.3, baseNoise);
            
            float landCoverage = smoothstep(3.5, 7.0, density);
            landmass = smoothstep(1.0 - landCoverage * 2.0, 1.0, landmass);
            
            float mountains = pow(max(0.0, baseNoise), 3.0) * 1.5;
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
        uniform float showLiquid;
        
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

        vec3 getLandColor(float height) {
          if (isGaseous < 0.5) {
            // Terrestrial planet colors
            if (height < 0.2) return vec3(0.0, 0.2, 0.5); // Deep water
            if (height < 0.3) return vec3(0.0, 0.4, 0.8); // Shallow water
            if (height < 0.5) return vec3(0.0, 0.8, 0.2); // Lowlands (green)
            if (height < 0.7) return vec3(0.8, 0.7, 0.2); // Hills (yellow-green)
            if (height < 0.9) return vec3(0.5, 0.3, 0.1); // Mountains (brown)
            return vec3(1.0, 1.0, 1.0); // Snow-capped peaks
          } else {
            // Gas giant colors (unchanged)
            return mix(color1, color2, height);
          }
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
            
            float atmosphere = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
            color += vec3(0.1, 0.15, 0.25) * atmosphere;
          } else {
            // Terrestrial coloring
            float height = (vElevation + 1.0) * 0.5; // Normalize elevation to 0-1 range
            color = getLandColor(height);
            
            // Add some variation
            float noise = snoise(vPosition * 10.0) * 0.1;
            color += vec3(noise);
            
            if (hasLiquid > 0.5 && height < 0.3 && showLiquid > 0.5) {
              vec3 waterColor = getLiquidColor(temperature);
              float waterDepth = smoothstep(0.3, 0.0, height);
              color = mix(color, waterColor, waterDepth);
              float shine = pow(fresnel, 4.0) * 0.3;
              color += vec3(shine);
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
        planetShader.uniforms.color1.value.setStyle("#7B3F00")
        planetShader.uniforms.color2.value.setStyle("#D2691E")
        planetShader.uniforms.color3.value.setStyle("#FFB90F")
      } else {
        planetShader.uniforms.color1.value.setStyle("#A7C6DA")
        planetShader.uniforms.color2.value.setStyle("#E6E6FA")
        planetShader.uniforms.color3.value.setStyle("#B8E2F2")
      }
    } else {
      planetShader.uniforms.color1.value.setStyle("#1E4D6B") // Deep water
      planetShader.uniforms.color2.value.setStyle("#CD853F") // Lowland
      planetShader.uniforms.color3.value.setStyle("#8B4513") // Highland
    }

    const atmosphereShader = new THREE.ShaderMaterial({
      uniforms: {
        atmosphereOpacity: { value: atmosphereOpacity },
        atmosphereColor: { value: new THREE.Color(0x87ceeb) },
        stormCount: { value: storms },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float atmosphereOpacity;
        uniform vec3 atmosphereColor;
        uniform int stormCount;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          float stormFactor = float(stormCount) / 4.0;
          vec3 finalColor = mix(atmosphereColor, vec3(1.0), stormFactor);
          gl_FragColor = vec4(finalColor, intensity * atmosphereOpacity);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
    })

    const stormShader = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        stormCount: { value: storms },
        temperature: { value: stats.temperature },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec3 pos = position;
          
          // Add some movement to the storms
          float movement = sin(time * 0.5 + position.x * 10.0) * 0.02;
          pos += normal * movement;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform int stormCount;
        uniform float temperature;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        vec3 getStormColor(float temp) {
          if (temp < 100.0) {
            return vec3(0.8, 0.8, 1.0); // Light blue for cold temperatures
          } else if (temp < 200.0) {
            return vec3(1.0, 1.0, 0.8); // Light yellow for cool temperatures
          } else if (temp < 300.0) {
            return vec3(1.0, 0.8, 0.8); // Light pink for moderate temperatures
          } else {
            return vec3(1.0, 0.6, 0.6); // Light red for hot temperatures
          }
        }
        
        void main() {
          vec3 stormColor = getStormColor(temperature);
          float alpha = 0.0;
          
          for (int i = 0; i < 4; i++) {
            if (i >= stormCount) break;
            
            vec3 stormCenter = normalize(vec3(
              sin(float(i) * 2.0 + time * 0.1),
              cos(float(i) * 3.0 + time * 0.2),
              sin(float(i) * 4.0 + time * 0.3)
            ));
            
            float stormDist = distance(vNormal, stormCenter);
            float stormStrength = smoothstep(0.2, 0.0, stormDist);
            
            alpha = max(alpha, stormStrength);
          }
          
          gl_FragColor = vec4(stormColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    return { planetMaterial: planetShader, atmosphereMaterial: atmosphereShader, stormMaterial: stormShader }
  }, [stats, atmosphereOpacity, showLiquid, storms])

  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.001
      planetMaterial.uniforms.time.value = state.clock.elapsedTime * 0.5
      planetMaterial.uniforms.sunDirection.value
        .set(Math.sin(state.clock.elapsedTime * 0.2), 0.5, Math.cos(state.clock.elapsedTime * 0.2))
        .normalize()
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0005
      atmosphereMaterial.uniforms.stormCount.value = storms
    }
    if (stormRef.current) {
      stormRef.current.rotation.y += 0.001
      stormMaterial.uniforms.time.value = state.clock.elapsedTime
      stormMaterial.uniforms.stormCount.value = storms
    }
  })

  const atmospherePosition = splitMeshes
    ? ([stats.radius * 2.5, 0, 0] as [number, number, number])
    : ([0, 0, 0] as [number, number, number])
  const stormPosition = splitMeshes
    ? ([stats.radius * 5, 0, 0] as [number, number, number])
    : ([0, 0, 0] as [number, number, number])

  return (
    <>
      <Sphere ref={planetRef} args={[1, 128, 128]} scale={stats.radius}>
        <primitive object={planetMaterial} attach="material" />
      </Sphere>
      {showAtmosphere && (
        <>
          <Sphere
            ref={atmosphereRef}
            args={[1 + atmosphereOffset, 64, 64]}
            scale={stats.radius}
            position={atmospherePosition}
          >
            <primitive object={atmosphereMaterial} attach="material" />
          </Sphere>
          {storms > 0 && (
            <Sphere
              ref={stormRef}
              args={[1 + atmosphereOffset + 0.01, 64, 64]}
              scale={stats.radius}
              position={stormPosition}
            >
              <primitive object={stormMaterial} attach="material" />
            </Sphere>
          )}
        </>
      )}
    </>
  );
};