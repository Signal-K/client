'use client';

import React, { useState, useEffect } from "react";

interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  cloudColours?: Record<string, number>;
}

interface AggregatedP4 {
  fanCount: number;
  blotchCount: number;
  classificationCounts: Record<string, number>;
}

interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
}

interface BiomeAggregatorProps {
  cloudSummary: AggregatedCloud | null;
  p4Summary: AggregatedP4 | null;
  ai4MSummary: AggregatedAI4M | null;
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

const getDominantBiome = (
  cloudSummary: AggregatedCloud | null,
  p4Summary: AggregatedP4 | null,
  ai4MSummary: AggregatedAI4M | null
): string => {
  const biomeTotals: Record<string, number> = {};
  const debugInfo: string[] = [];

  debugInfo.push("=== Biome Calculation Debug ===");

  // Cloud Colours Processing
  if (cloudSummary?.cloudColours) {
    debugInfo.push("\n--- Processing Cloud Colours ---");
    Object.entries(cloudSummary.cloudColours).forEach(([colour, count]) => {
      const normalizedColour = colour.toLowerCase().trim();
      if (biomeScores[normalizedColour]) {
        Object.entries(biomeScores[normalizedColour]).forEach(([biome, score]) => {
          biomeTotals[biome] = (biomeTotals[biome] || 0) + score * count;
        });
      }
    });
  }

  // P4 Classifications Processing
  if (p4Summary) {
    debugInfo.push("\n--- Processing P4 Data ---");
    biomeTotals["wind-affected terrain"] = (biomeTotals["wind-affected terrain"] || 0) + p4Summary.fanCount * 0.2;
    biomeTotals["dusty surface"] = (biomeTotals["dusty surface"] || 0) + p4Summary.blotchCount * 0.1;
  }

  // AI4M Classifications Processing
  if (ai4MSummary) {
    debugInfo.push("\n--- Processing AI4M Data ---");
    biomeTotals["sandy desert"] = (biomeTotals["sandy desert"] || 0) + ai4MSummary.sandCount * 0.15;
    biomeTotals["rocky terrain"] = (biomeTotals["rocky terrain"] || 0) + ai4MSummary.rockCount * 0.2;
    biomeTotals["consolidated soil"] = (biomeTotals["consolidated soil"] || 0) + ai4MSummary.soilCount * 0.1;
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

  return sortedBiomes.length > 0 ? String(sortedBiomes[0][0]) : "Unknown";
};

const BiomeAggregator: React.FC<BiomeAggregatorProps> = ({ cloudSummary, p4Summary, ai4MSummary }) => {
  const [dominantBiome, setDominantBiome] = useState<string>("Unknown");

  useEffect(() => {
    if (cloudSummary || p4Summary || ai4MSummary) {
      console.log("Full Aggregated Summary:", { cloudSummary, p4Summary, ai4MSummary });
      const biome = getDominantBiome(cloudSummary, p4Summary, ai4MSummary);
      setDominantBiome(biome);
    }
  }, []);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#4A665A] text-white">
      <h3 className="text-xl font-bold">Biome Aggregation</h3>
      <p>Dominant Biome: <strong>{dominantBiome}</strong></p>
    </div>
  );
};

export default BiomeAggregator;