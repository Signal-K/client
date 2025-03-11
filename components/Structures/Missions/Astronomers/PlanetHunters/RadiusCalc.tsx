'use client';

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "@/styles/Projects/Telescope/PlanetRadiusCalculator.css";

export default function PlanetRadiusCalculator() {
  const [stellarRadius, setStellarRadius] = useState<string>("");
  const [orbitalPeriod, setOrbitalPeriod] = useState<string>("");
  const [fluxDifferential, setFluxDifferential] = useState<string>("");
  const [planetRadius, setPlanetRadius] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<"stellarRadius" | "orbitalPeriod" | "fluxDifferential">("stellarRadius");

  useEffect(() => {
    if (stellarRadius && fluxDifferential) {
      const R_star = Number.parseFloat(stellarRadius); // Stellar radius in terms of the Sun's radius
      const F_planet = Number.parseFloat(fluxDifferential); // Flux differential

      if (!isNaN(R_star) && !isNaN(F_planet) && F_planet > 0) {
        // Assuming F_star = 1 (normalized flux of the star)
        const R_planet = R_star * Math.sqrt(F_planet);
        setPlanetRadius(Number(R_planet.toFixed(2)));
      } else {
        setPlanetRadius(null);
      }
    } else {
      setPlanetRadius(null);
    }
  }, [stellarRadius, fluxDifferential]);

  const handleButtonClick = (value: string) => {
    if (activeInput === "stellarRadius") {
      setStellarRadius((prev) => prev + value);
    } else if (activeInput === "orbitalPeriod") {
      setOrbitalPeriod((prev) => prev + value);
    } else if (activeInput === "fluxDifferential") {
      setFluxDifferential((prev) => prev + value);
    }
  };

  const handleClear = () => {
    if (activeInput === "stellarRadius") {
      setStellarRadius("");
    } else if (activeInput === "fluxDifferential") {
      setFluxDifferential("");
    }
  };

  const handleAllClear = () => {
    setStellarRadius("");
    setOrbitalPeriod("");
    setFluxDifferential("");
    setPlanetRadius(null);
  };

  return (
    <div className="planet-radius-calculator-container">
      <div className="planet-radius-calculator-card">
        <h2 className="planet-radius-calculator-heading">Planet Radius Calculator</h2>
        <p className="planet-radius-calculator-subheading">
          Formula: R<sub>p</sub> = R<sub>star</sub> × √(F<sub>planet</sub>)
        </p>
        <div className="space-y-4 mb-6">
          <div className="planet-radius-calculator-input-container">
            <Input
              type="text"
              value={stellarRadius}
              onChange={(e) => setStellarRadius(e.target.value)}
              className="planet-radius-calculator-input"
              placeholder=" "
              onFocus={() => setActiveInput("stellarRadius")}
            />
            <label className={`planet-radius-calculator-placeholder ${stellarRadius ? "active" : ""}`}>
              Stellar Radius (Solar Radii)
            </label>
          </div>
          <div className="planet-radius-calculator-input-container">
            <Input
              type="text"
              value={fluxDifferential}
              onChange={(e) => setFluxDifferential(e.target.value)}
              className="planet-radius-calculator-input"
              placeholder=" "
              onFocus={() => setActiveInput("fluxDifferential")}
            />
            <label className={`planet-radius-calculator-placeholder ${fluxDifferential ? "active" : ""}`}>
              Flux Differential (Normalized Flux)
            </label>
          </div>
          <div className="planet-radius-calculator-output-container">
            <div className="planet-radius-calculator-output">
              {planetRadius !== null ? `${planetRadius} R⊕` : "---"}
            </div>
            <label className="planet-radius-calculator-placeholder active">
              Planet Radius (Earth Radii)
            </label>
          </div>
        </div>
        <div className="planet-radius-calculator-button-grid">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."].map((btn) => (
            <Button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className="planet-radius-calculator-button"
            >
              {btn}
            </Button>
          ))}
          <Button onClick={handleClear} className="planet-radius-calculator-button">
            C
          </Button>
          <Button onClick={handleAllClear} className="planet-radius-calculator-button">
            AC
          </Button>
        </div>
      </div>
    </div>
  );
};