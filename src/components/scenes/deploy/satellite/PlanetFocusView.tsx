"use client"

import React from 'react';
import { Button } from '@/src/components/ui/button';
import type { EnrichedDatabaseAnomaly } from "./DeploySatellite";

interface PlanetFocusViewProps {
  planet: EnrichedDatabaseAnomaly | null; // Update type to use EnrichedDatabaseAnomaly
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const PlanetFocusView: React.FC<PlanetFocusViewProps> = ({ planet, onNext, onPrev, isFirst, isLast }) => {
  if (!planet) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-white">
        <div className="bg-gray-800/50 p-8 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">No Planet Selected</h2>
          <p className="text-gray-400">Discover planets with the telescope to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center text-white">
      {/* Planet Visual */}
      <div className="w-64 h-64 bg-blue-900/30 rounded-full flex items-center justify-center border-2 border-blue-400/50 shadow-2xl shadow-blue-500/20">
        <div className="w-56 h-56 bg-blue-800/50 rounded-full flex items-center justify-center">
          <div className="w-48 h-48 bg-blue-700/50 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Planet Info */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/30 p-4 rounded-lg backdrop-blur-sm">
        <h2 className="text-2xl font-bold">{planet.content || `TIC ${planet.id}`}</h2>
      </div>
      
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-full bg-black/30 p-4 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-2">Planet Stats</h3>
        <ul className="text-sm space-y-1">
          <li>Temperature: {planet.stats?.temperature || 'N/A'} K</li>
          <li>Radius: {planet.stats?.radius || 'N/A'} R☉</li>
          <li>Mass: {planet.stats?.mass || 'N/A'} M☉</li>
        </ul>
      </div>

      {/* Navigation */}
      <Button 
        onClick={onPrev} 
        disabled={isFirst}
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 disabled:opacity-30"
      >
        &lt;
      </Button>
      <Button 
        onClick={onNext} 
        disabled={isLast}
        className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full w-12 h-12 disabled:opacity-30"
      >
        &gt;
      </Button>
    </div>
  );
};

export default PlanetFocusView;
