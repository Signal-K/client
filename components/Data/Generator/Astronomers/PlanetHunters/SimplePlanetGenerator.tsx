import { useState, useEffect } from "react";
import { SimplePlanetScene } from "./planet-scene";
import { calculatePlanetStats } from "@/utils/planet-physics"; 
import type { PlanetStats } from "@/utils/planet-physics";
// import { PlanetGeneratorProps } from "./PlanetGenerator";
import { Button } from "@/components/ui/button";

export interface PlanetGeneratorProps {
    classificationConfig?: any;
    content?: string;
    classificationId: string;
    author: string;
    type?: string;
    biome?: string;
}; 

export default function SimplePlanetGenerator({ type, classificationConfig, biome }: PlanetGeneratorProps) {
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
        <>
            <div className="w-full h-full flex items-center justify-center">
                {/* <PlanetScene stats={stats} type={type} /> */}
                {/* <p>{biome}</p> */}
            </div>
        </>
    );
};

export function SimpleMeshPlanetGenerator({ type, classificationConfig }: PlanetGeneratorProps) {
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
        <>
            <div className="w-full h-full flex items-center justify-center">
                <SimplePlanetScene stats={stats} />
            </div>
        </>
    );
};