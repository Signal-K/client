'use client';

import React, { useState, useEffect } from "react";

interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  cloudColours?: Record<string, number>;
}

interface BiomeAggregatorProps {
  cloudSummary: AggregatedCloud | null;
}

const biomeScores: Record<string, Record<string, number>> = {
  "white": {
    "barren wasteland": 0.0,
    "arid dunes": 0.05,
    "frigid expanse": 0.1,
    "volcanic terrain": 0.1,
    "tundra basin": 0.2,
    "temperate highlands": 0.3,
    "oceanic world": 0.4,
    "tropical jungle": 0.5
  },
  "blue": {
    "barren wasteland": -0.05,
    "arid dunes": -0.1,
    "frigid expanse": -0.2,
    "volcanic terrain": -0.05,
    "tundra basin": 0.0,
    "temperate highlands": 0.05,
    "oceanic world": 0.1,
    "tropical jungle": 0.2
  }
};

const getDominantBiome = (cloudSummary: AggregatedCloud): string => {
  const biomeTotals: Record<string, number> = {};
  const debugInfo: string[] = [];

  debugInfo.push("=== Biome Calculation Debug ===");
  debugInfo.push(`Full Cloud Summary: ${JSON.stringify(cloudSummary, null, 2)}`);

  // Helper function to normalize keys
  const normalizeKey = (key: string) => key.toLowerCase().trim();

  // Process Cloud Colours
  debugInfo.push("\n--- Processing Cloud Colours ---");
  if (cloudSummary.cloudColours) {
    Object.entries(cloudSummary.cloudColours).forEach(([colour, count]) => {
      const normalizedColour = normalizeKey(colour);
      debugInfo.push(`Colour: ${normalizedColour}, Count: ${count}`);
      
      if (biomeScores[normalizedColour]) {
        Object.entries(biomeScores[normalizedColour]).forEach(([biome, score]) => {
          const biomeValue = score * count;
          biomeTotals[biome] = (biomeTotals[biome] || 0) + biomeValue;
          debugInfo.push(`  - Biome: ${biome}, Score: ${biomeValue}`);
        });
      } else {
        debugInfo.push(`  ! No scores found for colour: ${normalizedColour}`);
      }
    });
  } else {
    debugInfo.push("! No cloud colours found");
  }

  // Determine the dominant biome
  debugInfo.push("\n--- Biome Totals ---");
  const sortedBiomes = Object.entries(biomeTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([biome, score]) => {
      debugInfo.push(`${biome}: ${score}`);
      return [biome, score];
    });

  // Log the full debug information
  console.log(debugInfo.join('\n'));

  // Return dominant biome or default
  return sortedBiomes.length > 0 ? String(sortedBiomes[0][0]) : "Unknown";
};

const BiomeAggregator: React.FC<BiomeAggregatorProps> = ({ cloudSummary }) => {
  const [dominantBiome, setDominantBiome] = useState<string>("Unknown");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (cloudSummary) {
      console.log("Cloud Summary Received:", cloudSummary);
      
      // Explicitly convert to string
      const biome = getDominantBiome(cloudSummary);
      setDominantBiome(biome);
    } else {
      console.log("No cloud summary provided");
    }
  }, [cloudSummary]);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#4A665A] text-white">
      <h3 className="text-xl font-bold">Biome Aggregation</h3>
      <p>Dominant Biome: <strong>{dominantBiome}</strong></p>
    </div>
  );
};

export default BiomeAggregator;