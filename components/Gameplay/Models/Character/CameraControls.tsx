import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CameraModes,
  useCharacterCustomization,
} from "../../../../context/models/CharacterCustomisationContext";

import * as THREE from "three";

interface CameraControlsProps {}

const cameraPositions: Record<
  CameraModes,
  { position: THREE.Vector3; lookAt: THREE.Vector3 }
> = {
  [CameraModes.FREE]: {
    position: new THREE.Vector3(0, 0, 3),
    lookAt: new THREE.Vector3(0, 0, 0),
  },
  [CameraModes.HEAD]: {
    position: new THREE.Vector3(0, 0.5, 1),
    lookAt: new THREE.Vector3(0, 0.5, 0),
  },
  [CameraModes.TOP]: {
    position: new THREE.Vector3(-0.5, 0.2, 1.5),
    lookAt: new THREE.Vector3(0, 0.2, 0),
  },
  [CameraModes.BOTTOM]: {
    position: new THREE.Vector3(0, -0.5, 2.5),
    lookAt: new THREE.Vector3(0, -0.5, 0),
  },
};

export const CameraControls: React.FC<CameraControlsProps> = () => {
  const { cameraMode, setCameraMode } = useCharacterCustomization();
  const orbitControls = useRef(null);

  // Custom ref for OrbitControls
  const orbitControlsRef = useRef(null);

  useFrame((state, delta) => {
    if (cameraMode === CameraModes.FREE) {
      return;
    }
    const { position, lookAt } = cameraPositions[cameraMode];
    state.camera.position.lerp(position, 3 * delta);
    state.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

    // If OrbitControls ref is available, update it
    if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={(ref) => {
        orbitControls.current = ref;
        orbitControlsRef.current = ref;
      }}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      enableZoom={false}
      onStart={() => {
        setCameraMode(CameraModes.FREE);
      }}
    />
  );
};