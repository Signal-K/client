"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
// import { TopographicMap } from "@/components/topographic-map";

export default function TestPage() {
    return (
        <StarnetLayout>
          <>
          <div style={{ width: "100vw", height: "100vh" }}>
      <TopographicMap />
    </div>
          </>
        </StarnetLayout>
    );
};

/*
<ImageAnnotation src={imageUrls[currentImageIndex]} onUpload={uploadAnnotatedImage} />
  anomalies = {[
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ]}  />

*/

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

// Topographic shaders
const topographicVertexShader = `
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vElevation = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

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
`;

type TerrainProps = {
  seed: number;
  heightScale: number;
  bands: number;
  baseColor: string;
  contourColor: string;
};

const Terrain: React.FC<TerrainProps> = ({ seed, heightScale, bands, baseColor, contourColor }) => {
  const mesh = useRef<THREE.Mesh>(null); // Explicitly define mesh type
  const prng = useMemo(() => alea(seed), [seed]);
  const noise2D = useMemo(() => createNoise2D(prng), [prng]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 200, 200);
    const positions = geo.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const noise = noise2D(x * 0.05, y * 0.05);
      positions[i + 2] = noise * heightScale;
    }

    geo.computeVertexNormals();
    return geo;
  }, [noise2D, heightScale]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: topographicVertexShader,
      fragmentShader: topographicFragmentShader,
      uniforms: {
        uBaseColor: { value: new THREE.Color(baseColor) },
        uContourColor: { value: new THREE.Color(contourColor) },
        uBands: { value: bands },
        uContourWidth: { value: 0.1 },
      },
    });
  }, [baseColor, contourColor, bands]);

  return (
    <mesh ref={mesh} geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} />
  );
};

const TopographicMap = () => {
  return (
    <Canvas>
      <ambientLight />
      <Terrain
        seed={42}
        heightScale={1}
        bands={40}
        baseColor="#F5F5DC" // Beige
        contourColor="#8B4513" // SaddleBrown
      />
    </Canvas>
  );
};