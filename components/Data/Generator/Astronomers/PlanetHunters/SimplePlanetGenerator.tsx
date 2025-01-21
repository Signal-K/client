import { useState, useEffect } from "react";
import { PlanetScene } from "./planet-scene";
import { calculatePlanetStats } from "@/utils/planet-physics"; 
import type { PlanetStats } from "@/utils/planet-physics";
import { PlanetGeneratorProps } from "./PlanetGenerator";

export default function SimplePlanetGenerator({ classificationConfig }: PlanetGeneratorProps) {
    const initialMass = classificationConfig?.exportedValue?.mass ?? 1;
    const initialRadius = classificationConfig?.exportedValue?.radius ?? 1;

    const [mass, setMass] = useState(initialMass);
    const [radius, setRadius] = useState(initialRadius);

    const stats = calculatePlanetStats(mass, radius);

    useEffect(() => {
        if (classificationConfig?.exportedValue) {
            setMass(classificationConfig.exportedValue.mass);
            setRadius(classificationConfig.exportedValue.radius);
        }
    }, [classificationConfig]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <PlanetScene stats={stats} />
        </div>
    );
};