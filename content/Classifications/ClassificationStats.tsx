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
};

const biomeTraits: Record<string, string[]> = {
  "barren wasteland": ["slow", "nocturnal", "poisonous"],
  "arid dunes": ["slow", "nocturnal", "scaly"],
  "frigid expanse": ["slow", "scaly", "hairy", "nocturnal"],
  "volcanic terrain": ["slow", "poisonous", "scaly"],
  "temperate highlands": ["fast", "social", "feathered"],
  "oceanic world": ["amphibious", "social", "fast", "intelligent"],
  "tropical jungle": ["fast", "social", "feathered", "intelligent"],
  "rocky highlands": ["slow", "scaled", "nocturnal"],
  "flood basin": ["amphibious", "social", "intelligent"],
};

const getDominantBiome = (
  cloudSummary: AggregatedCloud | null,
  p4Summary: AggregatedP4 | null,
  ai4MSummary: AggregatedAI4M | null
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

  const sortedBiomes = Object.entries(biomeTotals).sort((a, b) => b[1] - a[1]);
  return sortedBiomes.length > 0 ? String(sortedBiomes[0][0]) : "Unknown";
};

const BiomeAggregator: React.FC<BiomeAggregatorProps> = ({ cloudSummary, p4Summary, ai4MSummary, onBiomeUpdate }) => {
  const [dominantBiome, setDominantBiome] = useState<string>("Unknown");
  const [weatherEvents, setWeatherEvents] = useState<string[]>([]);
  const [traits, setTraits] = useState<string[]>([]);

  useEffect(() => {
    if (cloudSummary || p4Summary || ai4MSummary) {
      const biome = getDominantBiome(cloudSummary, p4Summary, ai4MSummary);
      setDominantBiome(biome);
      setWeatherEvents(weatherByBiome[biome] || []);
      setTraits(biomeTraits[biome] || []);
      console.log('Biome:', biome);
      console.log('Traits:', biomeTraits[biome]);
      if (onBiomeUpdate) {
        onBiomeUpdate(biome);
      }
    }
  }, [cloudSummary, p4Summary, ai4MSummary, onBiomeUpdate]);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#4A665A] text-white">
      <h3 className="text-xl font-bold">Biome Aggregation</h3>
      <p>Dominant Biome: <strong>{dominantBiome}</strong></p>
      {traits.length > 0 && (
        <div className="mt-2">
          <h4 className="text-lg font-semibold">Potential Traits for Lifeforms:</h4>
          <ul className="list-disc list-inside">
            {traits.map((trait, index) => (
              <li key={index}>{trait}</li>
            ))}
          </ul>
        </div>
      )}
      {weatherEvents.length > 0 && (
        <div className="mt-2">
          <h4 className="text-lg font-semibold">Likely Weather Events:</h4>
          <ul className="list-disc list-inside">
            {weatherEvents.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BiomeAggregator;