'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
// import { PlanetScene } from "@/components/Data/Generator/Astronomers/PlanetHunters/V2/planet-scene";
// import { calculatePlanetStats, calculateTerrainHeight } from "@/utils/planet-physics";
import Link from "next/link";
import JVHCloudAggregator from "@/components/Structures/Missions/Meteorologists/JVH/JVHCloudAggregator";

export default function JupiterClassifications() {
    const supabase = useSupabaseClient();

    const [classifications, setClassifications] = useState<any[]>([]);
    const [showMetadata, setShowMetadata] = useState<boolean>(false);

    const [jvhClassifications, setJvhClassifications] = useState<any[]>([]);
    
    const toggleMetadataVisibility = () => setShowMetadata((prev) => !prev);

    useEffect(() => {
        const fetchClassifications = async () => {
            try {
                const {
                    data,
                    error
                } = await supabase
                    .from("classifications")
                    .select("*")
                    .in('classificationtype', [
                        'lidar-jovianVortexHunter'
                    ]);

                if (error) {
                    throw error;
                };

                setClassifications(data || []);
                setJvhClassifications(data.filter(c => c.classificationtype === 'lidar-jovianVortexHunter'));
            } catch (err: any) {
                console.error("Error fetching classifications: ", err.message);
            } finally {
                console.log('finally');
            };
        };

        fetchClassifications();
    }, [supabase]);

    const renderClassificationList = ( typeClassifications: any[], title: string ) => {
        if (typeClassifications.length === 0) {
            return null;
        };

        return (
            <div className="mb-8">
                <h2 className="text-lg font-bold mb-2 text-yellow-400">{title}</h2>
                <ul className="space-y-4">
                    {typeClassifications.map((classification) => (
                        <li key={classification.id} className="p-4 border rounded-lg bg-gray-900">
                            <p className="text-sm text-gray-400">Created At: {new Date(classification.created_at).toLocaleString()}</p>
                            <p><strong>Content: </strong> {classification.content} </p>
                            <p><strong>Author: </strong> {classification.author} </p>
                            <p><strong>Anomaly:</strong> {classification.anomaly ?? "None"}</p>

                            {classification.media && (
                                <div className="mt-2">
                                    <strong>Media:</strong>
                                    <pre className="bg-gray-800 p-2 rounded text-sm">{JSON.stringify(classification.media, null, 2)}</pre>
                                </div>
                            )}

                            {classification.classificationConfiguration && (
                                <div className="mt-2">
                                    <strong>Classification Configuration:</strong>
                                    <pre className="bg-gray-800 p-2 rounded text-sm">{JSON.stringify(classification.classificationConfiguration, null, 2)}</pre>
                                </div>
                            )}

                            {classification.annotationOptions?.length > 0 && (
                                <div className="mt-2">
                                    <strong>Annotations:</strong>
                                    <ul className="list-disc list-inside text-sm">
                                        {classification.annotationOptions.map((option: string, index: number) => (
                                        <li key={index}>{option}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const [mass, setMass] = useState(317.8);
    const [radius, setRadius] = useState(11.21);
    const [temperature, setTemperature] = useState(165.0);
    const [orbitalPeriod, setOrbitalPeriod] = useState(4333.0);
    const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>("gaseous");
    const [atmosphereStrength, setAtmosphereStrength] = useState(1.0);
    const [cloudCount, setCloudCount] = useState(0); // Jupiter doesn't really have a "cloud count," but this can stay 0 or be repurposed
    const [waterHeight, setWaterHeight] = useState(0.0);
    const [surfaceRoughness, setSurfaceRoughness] = useState(0.0);
    const [biomeFactor, setBiomeFactor] = useState(0.0);
    const [cloudContribution, setCloudContribution] = useState(1.0);
    const [terrainVariation, setTerrainVariation] = useState<"flat" | "moderate" | "chaotic">("chaotic");
    // const [terrainVariation, setTerrainVariation] = useState<"flat" | "moderate" | "chaotic" | "turbulent">("turbulent");
    const [terrainErosion, setTerrainErosion] = useState(0.0);
    const [plateTectonics, setPlateTectonics] = useState(0.0);
    // const [soilType, setSoilType] = useState<"rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy" | "none">("none");
    const [biomassLevel, setBiomassLevel] = useState(0.0);
    const [waterLevel, setWaterLevel] = useState(0.0);
    const [salinity, setSalinity] = useState(0.0);
    const [subsurfaceWater, setSubsurfaceWater] = useState(0.0);
    const [atmosphericDensity, setAtmosphericDensity] = useState(2.5);
    const [weatherVariability, setWeatherVariability] = useState(0.9);
    const [stormFrequency, setStormFrequency] = useState(0.95);
    const [volcanicActivity, setVolcanicActivity] = useState(0.0);
    const [biome, setBiome] = useState("Gas Giant");
    // const [cloudTypes, setCloudTypes] = useState<string[]>([""]); // Ammonia Crystals", "Water Ice", "Ammonium Hydrosulfide
    // const [cloudDensity, setCloudDensity] = useState(0.98);
    const [atmosphereVisibility, setAtmosphereVisibility] = useState(1);
    const [atmosphereHeight, setAtmosphereHeight] = useState(1);

    // const stats = calculatePlanetStats(
    //     mass,
    //     radius,
    //     temperature,
    //     orbitalPeriod,
    //     typeOverride,
    //     atmosphereStrength,
    //     cloudCount,
    //     waterHeight,
    //     surfaceRoughness,
    //     undefined,
    //     biomeFactor,
    //     cloudContribution,
    //     terrainVariation,
    //     terrainErosion,
    //     plateTectonics,
    //     biomassLevel,
    //     waterLevel,
    //     salinity,
    //     subsurfaceWater,
    //     atmosphericDensity,
    //     weatherVariability,
    //     stormFrequency,
    //     volcanicActivity,
    //     biome,
    // );  
    
    //     const terrainHeight = calculateTerrainHeight(stats);

    return (
        <div className="p-6 bg-black text-white border rounded-md opacity-80 shadow-md relative">
            <Navbar />
            <div className="py-10">
                <h1 className="text-xl font-bold mb-4">Jupiter Discoveries</h1>
                {/* <PlanetScene
                    stats={stats}
                    terrainHeight={terrainHeight}
                /> */}
                <button
                    onClick={toggleMetadataVisibility}
                    className="ml-4 px-4 bg-green-500 text-white rounded-sm"
                >
                    {showMetadata ? 'Hide metadata' : 'Show metadata'}
                </button>

                {/* Aggregators go here when implemented 
                {showMetadata && (
                    <div>
                        {renderClassificationList(satelliteP4Classifications, 'Satellite - Planet Four')}
                        
                    </div>
                */}
                {showMetadata && (
                    <div>
                        {renderClassificationList(jvhClassifications, 'Jovian Vortex Hunters')}
                        <div>
    {renderClassificationList(jvhClassifications, "Jovian Vortex Hunters")}
    <JVHCloudAggregator classifications={jvhClassifications} />
  </div>
                    </div>
                )}
            </div>
        </div>
    );
};