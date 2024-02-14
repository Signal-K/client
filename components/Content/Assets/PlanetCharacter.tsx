import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const PlanetCharacter: React.FC = () => {
    const [angle, setAngle] = useState<number>(0);
    // State to store animation direction (1 for right, -1 for left)
    const [direction, setDirection] = useState<number>(1);
  
    // Function to update animation angle and direction
    const updateAnimation = () => {
      // Increment angle based on direction
      const newAngle = angle + 1 * direction;
      // Change direction when angle reaches certain limits
      if (newAngle >= 10 || newAngle <= -10) {
        setDirection(direction * -1);
      }
      // Update angle
      setAngle(newAngle);
    };
  
    // Update animation angle every 50 milliseconds
    useEffect(() => {
      const interval = setInterval(updateAnimation, 50);
      return () => clearInterval(interval); // Cleanup interval on unmount
    }, [angle, direction]);

  return (
    <div className="relative w-64 h-64">
      <Image
        src="/assets/Inventory/Planets/Mars caricature.png" // Replace with the path to your character image
        alt="Character"
        width={256}
        height={256}
        className="transform transition-transform duration-500"
        style={{ transform: `rotate(${angle}deg)` }} // Apply rotation based on angle
      />
    </div>
  );
};

export default PlanetCharacter;