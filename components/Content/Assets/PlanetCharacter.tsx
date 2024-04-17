import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const RoverCharacter: React.FC<{ position: { x: number; y: number } }> = ({ position }) => {
  const [angle, setAngle] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(updateAnimation, 50);
    return () => clearInterval(interval);
  }, []);

  const updateAnimation = () => {
    const newAngle = angle + 1 * direction;
    if (newAngle >= 10 || newAngle <= -10) {
      setDirection(direction * -1);
    }
    setAngle(newAngle);
  };

  return (
    <div className="absolute" style={{ left: `${position.x}px`, bottom: `${position.y}px` }}>
      <Image
        src="/assets/Inventory/Planets/rover.png"
        alt="Character"
        layout="fill"
        objectFit="contain"
        className="transform transition-transform duration-500"
        style={{ transform: `rotate(${angle}deg)` }}
      />
    </div>
  );
};

export const PlanetCharacter: React.FC<{ position: { x: number; y: number } }> = ({ position }) => {
  const [angle, setAngle] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(updateAnimation, 50);
    return () => clearInterval(interval);
  }, []);

  const updateAnimation = () => {
    const newAngle = angle + 1 * direction;
    if (newAngle >= 10 || newAngle <= -10) {
      setDirection(direction * -1);
    }
    setAngle(newAngle);
  };

  return (
    <div className="absolute" style={{ left: `${position.x}px`, bottom: `${position.y}px` }}>
      <Image
        src="/assets/Inventory/Planets/Mars.png"
        alt="Character"
        layout="fill"
        objectFit="contain"
        className="transform transition-transform duration-500"
        style={{ transform: `rotate(${angle}deg)` }}
      />
    </div>
  );
};

export default PlanetCharacter;