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
  biomassVersion: number;
  onBiomeUpdate?: (biome: string) => void;
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
    "tropical jungle": 0.5,
    "barren jungle": 0.0,
    "sparse desert": 0.025,
    "empty ocean": 0.05,
  },
  "blue": {
    "barren wasteland": -0.05,
    "arid dunes": -0.1,
    "frigid expanse": -0.2,
    "volcanic terrain": -0.05,
    "tundra basin": 0.0,
    "temperate highlands": 0.05,
    "oceanic world": 0.1,
    "tropical jungle": 0.2,
    "barren jungle": 0.05,
    "sparse desert": 0.025,
    "empty ocean": 0.1,
  },
};

const traitsByBiome: Record<string, string[]> = {
  "volcanic terrain": ["Poisonous", "Fast", "Scaled", "Bald"],
  "frigid expanse": ["Hairy", "Slow", "Nocturnal", "Intelligent"],
  "arid dunes": ["Fast", "Scaled", "Bald", "Nocturnal"],
  "tropical jungle": ["Flying", "Wings", "Feathered", "Social", "Intelligent", "Poisonous"],
  "oceanic world": ["Amphibious", "Fast", "Social", "Intelligent", "Poisonous", "Nocturnal"],
  "temperate highlands": ["Hairy", "Social", "Intelligent", "Fast", "Feathered"],
  "rocky highlands": ["Scaled", "Fast", "Bald", "Intelligent"],
  "barren wasteland": ["Slow", "Bald", "Poisonous", "Nocturnal"],
  "barren jungle": ["Slow", "Nocturnal", "Scattered Vegetation"],
  "sparse desert": ["Minimal", "Slow", "Nocturnal"],
  "empty ocean": ["Amphibious", "Minimal"],
};

const weatherByBiome: Record<string, string[]> = {
  "rocky highlands": ["Rain", "Thunderstorms", "Dust Storms", "Seismic Activity"],
  "rocky terrain": ["Rain", "Thunderstorms", "Dust Storms", "Seismic Activity"],
  "consolidated soil": ["Rain", "Thunderstorms", "Dust Storms", "Seismic Activity"],
  "wind-affected terrain": ["Rain", "Thunderstorms", "Dust Storms", "Seismic Activity"],
  "barren wasteland": ["Acid Rain", "Dust Storms", "Ion Storms", "Impact Events"],
  "arid dunes": ["Dust Storms", "Ion Storms", "Occasional Rain"],
  "dusty surface": ["Dust Storms", "Ion Storms", "Occasional Rain"],
  "sandy desert": ["Dust Storms", "Ion Storms", "Occasional Rain"],
  "frigid expanse": ["Snow", "Sleet", "Ice Storms", "Cryovolcanism"],
  "volcanic terrain": ["Volcanic Eruptions", "Geysers", "Seismic Activity", "Acid Rain"],
  "temperate highlands": ["Rain", "Thunderstorms", "Hail", "Hurricanes"],
  "oceanic world": ["Rain", "Hurricanes", "Tsunamis", "Deep Ocean Storms"],
  "tropical jungle": ["Rain", "Superstorms", "Flooding", "Thunderstorms"],
  "barren jungle": ["Sparse Rain", "Occasional Winds"],
  "sparse desert": ["Dust Storms", "Occasional Winds"],
  "empty ocean": ["Calm Seas", "Occasional Winds"],
  "basalt plains": ["Rain", "Dust Storms", "Occasional Thunder"],
  "sediment flats": ["Rain", "Flash Floods", "Hail"],
  "cratered terrain": ["Dust Storms", "Impact Events", "Seismic Activity"],
  "tundra basin": ["Snow", "Permafrost Winds", "Ice Storms"],
  "flood basin": ["Flooding", "Heavy Rain", "Thunderstorms"],
  "coral reefs": ["Tropical Storms", "Tsunamis", "Heavy Rain"],
  "dune fields": ["Sandstorms", "Ion Storms", "High Wind Gusts"],
};

const biomeTraits: Record<string, string[]> = {
  "barren wasteland": ["slow", "nocturnal", "poisonous"],
  "arid dunes": ["fast", "scaled", "bald", "nocturnal"],
  "frigid expanse": ["slow", "scaled", "hairy", "nocturnal"],
  "volcanic terrain": ["slow", "poisonous", "scaled"],
  "temperate highlands": ["fast", "social", "feathered"],
  "oceanic world": ["amphibious", "social", "fast", "intelligent"],
  "tropical jungle": ["fast", "social", "feathered", "intelligent"],
  "rocky highlands": ["scaled", "fast", "bald", "intelligent"],
  "wind-affected terrain": ["scaled", "fast", "bald", "intelligent"],
  "flood basin": ["amphibious", "social", "intelligent"],
  "barren jungle": ["slow", "nocturnal", "scattered vegetation"],
  "sparse desert": ["minimal", "slow", "nocturnal"],
  "empty ocean": ["amphibious", "minimal"],
};

const getDominantBiome = (
  cloudSummary: AggregatedCloud | null,
  p4Summary: AggregatedP4 | null,
  ai4MSummary: AggregatedAI4M | null,
  biomassVersion: number
): string => {
  const biomeTotals: Record<string, number> = {};

  if (cloudSummary?.cloudColours) {
    Object.entries(cloudSummary.cloudColours).forEach(([colour, count]) => {
      const normalizedColour = colour.toLowerCase().trim();
      if (biomeScores[normalizedColour]) {
        Object.entries(biomeScores[normalizedColour]).forEach(([biome, score]) => {
          biomeTotals[biome] = (biomeTotals[biome] || 0) + Number(score) * Number(count);
        });
      }
    });
  }

  if (p4Summary) {
    biomeTotals["wind-affected terrain"] = (biomeTotals["wind-affected terrain"] || 0) + p4Summary.fanCount * 0.2;
    biomeTotals["dusty surface"] = (biomeTotals["dusty surface"] || 0) + p4Summary.blotchCount * 0.1;
  }

  if (ai4MSummary) {
    biomeTotals["sandy desert"] = (biomeTotals["sandy desert"] || 0) + ai4MSummary.sandCount * 0.15;
    biomeTotals["rocky terrain"] = (biomeTotals["rocky terrain"] || 0) + ai4MSummary.rockCount * 0.2;
    biomeTotals["consolidated soil"] = (biomeTotals["consolidated soil"] || 0) + ai4MSummary.soilCount * 0.1;
  }

  Object.keys(biomeTotals).forEach((biome) => {
    biomeTotals[biome] = biomeTotals[biome] * biomassVersion;
  });

  const sortedBiomes = Object.entries(biomeTotals).sort((a, b) => b[1] - a[1]);
  return sortedBiomes.length > 0 ? String(sortedBiomes[0][0]) : "Unknown";
};

const BiomeAggregator: React.FC<BiomeAggregatorProps> = ({ cloudSummary, p4Summary, ai4MSummary, biomassVersion, onBiomeUpdate }) => {
  const [dominantBiome, setDominantBiome] = useState<string>("Unknown");
  const [weatherEvents, setWeatherEvents] = useState<string[]>([]);
  const [traits, setTraits] = useState<string[]>([]);

  useEffect(() => {
    if (cloudSummary || p4Summary || ai4MSummary) {
      const biome = getDominantBiome(cloudSummary, p4Summary, ai4MSummary, biomassVersion);
      setDominantBiome(biome);
      setWeatherEvents(weatherByBiome[biome] || []);
      setTraits(biomeTraits[biome] || []);
      if (onBiomeUpdate) {
        onBiomeUpdate(biome);
      }
    }
  }, [cloudSummary, p4Summary, ai4MSummary, biomassVersion, onBiomeUpdate]);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#4A665A] text-white">
      <h3 className="text-xl font-bold">Biome Aggregation</h3>
      <div className="mt-4">
        <h4 className="text-lg font-semibold">Dominant Biome: {dominantBiome}</h4>
        <ul>
          {traits.map((trait, index) => (
            <li key={index}>{trait}</li>
          ))}
        </ul>
        {cloudSummary && (
          <p>{JSON.stringify(cloudSummary)}</p>
        )}
        {p4Summary && (
          <p>{JSON.stringify(p4Summary)}</p>
        )}
        {ai4MSummary && (
          <p>{JSON.stringify(ai4MSummary)}</p>
        )}
        <h4 className="mt-4 text-lg font-semibold">Weather Events:</h4>
        <ul>
          {weatherEvents.map((event, index) => (
            <li key={index}>{event}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BiomeAggregator;