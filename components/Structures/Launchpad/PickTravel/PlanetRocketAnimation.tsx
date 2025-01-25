import type React from "react";
import { useState, useEffect } from "react";
import Earth from "../../../Data/Generator/Astronomers/PlanetHunters/Earth";
import FuzzyPlanet from "../../../Data/Generator/Astronomers/PlanetHunters/FuzzyPlanet";
import Rocket from "./Rocket";
import { Button } from "@/components/ui/button";

interface PlanetRocketAnimationProps {
  onFinish: () => void;
}

const PlanetRocketAnimation: React.FC<PlanetRocketAnimationProps> = ({ onFinish }) => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const handleLaunch = () => {
    setIsLaunched(true);
    setTimeout(() => setIsRotated(true), 1000);
    setTimeout(() => {
      setIsFinished(true);
      onFinish(); // Trigger onFinish callback when the animation is done
    }, 6000);
  };

  const handleReset = () => {
    setIsLaunched(false);
    setIsRotated(false);
    setIsFinished(false);
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2">
        <Earth />
      </div>
      <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2">
        <FuzzyPlanet />
      </div>
      <Rocket isLaunched={isLaunched} isRotated={isRotated} isFinished={isFinished} />
      <div className="absolute bottom-10">
        {!isLaunched && <Button onClick={handleLaunch}>Launch Rocket</Button>}
        {isFinished && <Button onClick={handleReset}>Reset Animation</Button>}
      </div>
    </div>
  );
};

export default PlanetRocketAnimation;