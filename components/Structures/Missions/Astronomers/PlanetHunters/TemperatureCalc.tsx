"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "@/styles/Projects/Telescope/PlanetTemperatureCalculator.css";

export default function PlanetTempCalculator() {
  const [starTemp, setStarTemp] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [planetTemp, setPlanetTemp] = useState<number | null>(null);
  const [activeInput, setActiveInput] = useState<"starTemp" | "period">("starTemp");

  useEffect(() => {
    if (starTemp && period) {
      const T_star = Number.parseFloat(starTemp);
      const P = Number.parseFloat(period);
      if (!isNaN(T_star) && !isNaN(P) && P > 0) {
        const Tp = T_star * Math.pow(P, -0.5);
        setPlanetTemp(Number(Tp.toFixed(2)));
      } else {
        setPlanetTemp(null);
      };
    } else {
      setPlanetTemp(null);
    };
  }, [starTemp, period]);

  const handleButtonClick = (value: string) => {
    if (activeInput === "starTemp") {
      setStarTemp((prev) => prev + value);
    } else if (activeInput === "period") {
      setPeriod((prev) => prev + value);
    };
  };  

  const handleClear = () => {
    if (activeInput === "starTemp") {
      setStarTemp("");
    } else {
      setPeriod("");
    };
  };

  const handleAllClear = () => {
    setStarTemp("");
    setPeriod("");
    setPlanetTemp(null);
  };

  return (
    <div className="planet-temp-calculator-container">
      <div className="planet-temp-calculator-card">
        <h2 className="planet-temp-calculator-heading">Planet Temp Calculator</h2>
        <p className="planet-temp-calculator-subheading">
          Formula: T<sub>p</sub> = T<sub>star</sub> * (P<sup>-0.5</sup>)
        </p>
        <div className="space-y-4 mb-6">
          <div className="planet-temp-calculator-input-container">
          <Input
            type="text"
            value={starTemp}
            onChange={(e) => setStarTemp(e.target.value)}
            className="planet-temp-calculator-input"
            placeholder=" "
            onFocus={() => setActiveInput("starTemp")}
          />
            <label className={`planet-temp-calculator-placeholder ${starTemp ? "active" : ""}`}>
              Temperature of Parent Star (Kelvin)
            </label>
          </div>
          <div className="planet-temp-calculator-input-container">
            <Input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="planet-temp-calculator-input"
              placeholder=" "
              onFocus={() => setActiveInput("period")}
            />
            <label className={`planet-temp-calculator-placeholder ${period ? "active" : ""}`}>
              Orbital Period (Days)
            </label>
          </div>
          <div className="planet-temp-calculator-output-container">
            <div className="planet-temp-calculator-output">
              {planetTemp !== null ? `${planetTemp} K` : "---"}
            </div>
            <label className="planet-temp-calculator-placeholder active">
              Temperature of Planet (Kelvin)
            </label>
          </div>
        </div>
        <div className="planet-temp-calculator-button-grid">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."].map((btn) => (
            <Button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className="planet-temp-calculator-button"
            >
              {btn}
            </Button>
          ))}
          <Button onClick={handleClear} className="planet-temp-calculator-button">
            C
          </Button>
          <Button onClick={handleAllClear} className="planet-temp-calculator-button">
            AC
          </Button>
        </div>
      </div>
    </div>
  );
};