import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Sprite, SpriteMaterial, TextureLoader } from "three";
import { useFrame } from "@react-three/fiber";

interface Landmass {
  lat: number;
  lng: number;
  imageURL: string;
  onClickFunction: () => void;
}

interface ClickableImagesProps {
  landmasses: Landmass[];
}

function ClickableImages({ landmasses }: ClickableImagesProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (groupRef.current) {
      landmasses.forEach((landmass) => {
        const { lat, lng, imageURL, onClickFunction } = landmass;

        // Load texture
        const textureLoader = new TextureLoader();
        const texture = textureLoader.load(imageURL);

        // Create a sprite with the texture
        const spriteMaterial = new SpriteMaterial({ map: texture });
        const sprite = new Sprite(spriteMaterial);

        // Set the size of the sprite
        const size = 8; // Adjust size as needed (e.g. 8 for Tailwind scale)
        sprite.scale.set(size, size, 1);

        // Convert lat/lng to 3D coordinates
        const radius = 100; // Adjust radius as needed
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = lng * (Math.PI / 180);
        sprite.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );

        // Create a click handler for the sprite
        const handleClick = (event: any) => {
          event.stopPropagation();
          onClickFunction();
        };

        // Add event listener to the sprite for the 'click' event
        sprite.addEventListener('click', handleClick);

        // Add the sprite to the group
        groupRef.current.add(sprite);
      });
    }
  }, [landmasses]);

  // Use useFrame hook to continuously update the scene if needed
  useFrame(() => {
    // Add any animation logic here if required
  });

  return <group ref={groupRef} />;
}

export default ClickableImages;