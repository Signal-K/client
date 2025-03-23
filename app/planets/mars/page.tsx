'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import SatellitePlanetFourAggregator from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/P4Aggregator";
import AI4MAggregator from "@/components/Structures/Missions/Astronomers/SatellitePhotos/AI4M/AI4MAggregator";
import { AggregatedCloud, AggregatedAI4M, AggregatedP4 } from "../[id]/page";
import { PlanetScene } from "@/components/Data/Generator/Astronomers/PlanetHunters/V2/planet-scene";
import { calculatePlanetStats, calculateTerrainHeight } from "@/utils/planet-physics";

export default function MarsClassifications() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  // Anomaly/classification summaries
  const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
  const [p4Summary, setP4Summary] = useState<AggregatedP4 | null>(null);
  const [ai4MSummary, setAI4MSummary] = useState<AggregatedAI4M | null>(null);

  // Individual classification type states
  const [cloudClassifications, setCloudClassifications] = useState<any[]>([]);
  const [satelliteP4Classifications, setSatelliteP4Classifications] = useState<any[]>([]);
  const [ai4MClassifications, setAi4MClassifications] = useState<any[]>([]);
  const [balloonClassifications, setBalloonClassifications] = useState<any[]>([]);

  // Toggle for metadata visibility
  const toggleMetadataVisibility = () => setShowMetadata((prev) => !prev);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("classifications")
          .select('*')
          .in('classificationtype', [
            'satellite-planetFour',
            'automaton-aiForMars',
            'cloud',
            'balloon-marsCloudShapes'
          ]);

        if (error) throw error;

        setClassifications(data || []);

        // Filter classifications into their respective groups
        setCloudClassifications(data.filter(c => c.classificationtype === 'cloud'));
        setSatelliteP4Classifications(data.filter(c => c.classificationtype === 'satellite-planetFour'));
        setAi4MClassifications(data.filter(c => c.classificationtype === 'automaton-aiForMars'));
        setBalloonClassifications(data.filter(c => c.classificationtype === 'balloon-marsCloudShapes'));

      } catch (err: any) {
        console.error("Error fetching classifications:", err.message);
        setError("Failed to fetch classifications");
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, [supabase]);

  // if (loading) return <div>Loading classifications...</div>;
  // if (error) return <div>Error: {error}</div>;

  // Summary update handlers
  const handleCloudSummaryUpdate = (summary: AggregatedCloud) => setCloudSummary(summary);
  const handleP4SummaryUpdate = (summary: AggregatedP4) => setP4Summary(summary);
  const handleAI4MSummaryUpdate = (summary: AggregatedAI4M) => setAI4MSummary(summary);

  // Classification content rendering
  const renderClassificationList = (typeClassifications: any[], title: string) => {
    if (typeClassifications.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-2 text-yellow-400">{title}</h2>
        <ul className="space-y-4">
          {typeClassifications.map((classification) => (
            <li key={classification.id} className="p-4 border rounded-lg bg-gray-900">
              <p className="text-sm text-gray-400">Created At: {new Date(classification.created_at).toLocaleString()}</p>
              <p><strong>Content:</strong> {classification.content || "No content available"}</p>
              <p><strong>Author:</strong> {classification.author || "Unknown"}</p>
              <p><strong>Anomaly:</strong> {classification.anomaly ?? "None"}</p>

              {/* Handle optional media */}
              {classification.media && (
                <div className="mt-2">
                  <strong>Media:</strong>
                  <pre className="bg-gray-800 p-2 rounded text-sm">{JSON.stringify(classification.media, null, 2)}</pre>
                </div>
              )}

              {/* Handle optional configuration */}
              {classification.classificationConfiguration && (
                <div className="mt-2">
                  <strong>Classification Configuration:</strong>
                  <pre className="bg-gray-800 p-2 rounded text-sm">{JSON.stringify(classification.classificationConfiguration, null, 2)}</pre>
                </div>
              )}

              {/* Safely handle annotationOptions */}
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

  const [mass, setMass] = useState(0.107);
  const [radius, setRadius] = useState(0.532);
  const [temperature, setTemperature] = useState(210.0);
  const [orbitalPeriod, setOrbitalPeriod] = useState(687.0);
  const [typeOverride, setTypeOverride] = useState<"terrestrial" | "gaseous" | null>("terrestrial");
  const [atmosphereStrength, setAtmosphereStrength] = useState(0.01);
  const [cloudCount, setCloudCount] = useState(5.412);
  const [waterHeight, setWaterHeight] = useState(0.02);
  const [surfaceRoughness, setSurfaceRoughness] = useState(0.72);
  const [biomeFactor, setBiomeFactor] = useState(0.14);
  const [cloudContribution, setCloudContribution] = useState(0.12);
  const [terrainVariation, setTerrainVariation] = useState<"flat" | "moderate" | "chaotic">("chaotic");
  const [terrainErosion, setTerrainErosion] = useState(0.03);
  const [plateTectonics, setPlateTectonics] = useState(0.01);
  const [soilType, setSoilType] = useState<"rocky" | "sandy" | "volcanic" | "organic" | "dusty" | "frozen" | "muddy">("dusty");
  const [biomassLevel, setBiomassLevel] = useState(0.0);
  const [waterLevel, setWaterLevel] = useState(0.01);
  const [salinity, setSalinity] = useState(0.22);
  const [subsurfaceWater, setSubsurfaceWater] = useState(0.38);
  const [atmosphericDensity, setAtmosphericDensity] = useState(0.02);
  const [weatherVariability, setWeatherVariability] = useState(0.41);
  const [stormFrequency, setStormFrequency] = useState(0.14);
  const [volcanicActivity, setVolcanicActivity] = useState(0.001);
  const [biome, setBiome] = useState("Barren Wasteland");
  const [cloudTypes, setCloudTypes] = useState<string[]>([""]);
  const [cloudDensity, setCloudDensity] = useState(0.5);
  const [atmosphereVisibility, setAtmosphereVisibility] = useState(1);
  const [atmosphereHeight, setAtmosphereHeight] = useState(1);  
  
  const stats = calculatePlanetStats(
    mass,
    radius,
    temperature,
    orbitalPeriod,
    typeOverride,
    atmosphereStrength,
    cloudCount,
    waterHeight,
    surfaceRoughness,
    undefined,
    biomeFactor,
    cloudContribution,
    terrainVariation,
    terrainErosion,
    plateTectonics,
    biomassLevel,
    waterLevel,
    salinity,
    subsurfaceWater,
    atmosphericDensity,
    weatherVariability,
    stormFrequency,
    volcanicActivity,
    biome,
  );  

  const terrainHeight = calculateTerrainHeight(stats);

  return (
    <div className="p-6 bg-black text-white border rounded-md opacity-80 shadow-md relative">
      <Navbar />
      <div className="py-10">
        <h1 className="text-xl font-bold mb-4">Mars Classifications</h1>
        <PlanetScene
          stats={
            stats
          }
          terrainHeight={terrainHeight}

        />
        <button
          onClick={toggleMetadataVisibility}
          className="ml-4 px-4 bg-green-500 text-white rounded-md"
        >
          {showMetadata ? 'Hide metadata' : 'Show metadata'}
        </button>

        {/* Cloud Classification Summary */}
        {cloudClassifications.length > 0 && (
          <CloudClassificationSummary
            classifications={cloudClassifications}
            onSummaryUpdate={handleCloudSummaryUpdate}
          />
        )}

        {/* SP4 Classification Summary */}
        {satelliteP4Classifications.length > 0 && (
          <SatellitePlanetFourAggregator
            classifications={satelliteP4Classifications}
            onSummaryUpdate={handleP4SummaryUpdate}
          />
        )}

        {/* AI4M Classification Summary */}
        {ai4MClassifications.length > 0 && (
          <AI4MAggregator
            classifications={ai4MClassifications}
            onSummaryUpdate={handleAI4MSummaryUpdate}
          />
        )}

        {/* Metadata Section */}
        {showMetadata && (
          <div>
            {renderClassificationList(satelliteP4Classifications, 'Satellite - Planet Four')}
            {renderClassificationList(ai4MClassifications, 'Automaton - AI for Mars')}
            {renderClassificationList(cloudClassifications, 'Cloud')}
            {renderClassificationList(balloonClassifications, 'Balloon - Mars Cloud Shapes')}
          </div>
        )}
      </div>
    </div>
  );
};