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
  isDarkMode?: boolean;
}

// Helper function to interpret stellar metallicity [Fe/H] values
function interpretMetallicity(value: string | number | null | undefined): string {
  if (!value) return '';
  const numVal = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numVal)) return '';
  
  // Solar metallicity is [Fe/H] = 0
  // Negative = less metals than Sun (older, metal-poor stars)
  // Positive = more metals than Sun (younger, metal-rich stars)
  
  if (numVal > 0.3) return '(Very metal-rich, young star)';
  if (numVal > 0.1) return '(Metal-rich, younger than Sun)';
  if (numVal > -0.1) return '(Similar to Sun)';
  if (numVal > -0.3) return '(Slightly metal-poor)';
  if (numVal > -0.5) return '(Metal-poor, older star)';
  return '(Very metal-poor, ancient star)';
}

const PlanetFocusView: React.FC<PlanetFocusViewProps> = ({ planet, onNext, onPrev, isFirst, isLast, isDarkMode = true }) => {
  console.log('🎨 PlanetFocusView render:', planet?.id, 'stats:', planet?.stats);
  
  if (!planet) {
    return (
      <div className={`flex flex-col items-center justify-center h-full w-full ${
        isDarkMode ? 'text-white' : 'text-slate-800'
      }`}>
        <div className={`p-8 rounded-lg text-center ${
          isDarkMode 
            ? 'bg-gray-800/50' 
            : 'bg-gradient-to-br from-[#f0f4ff]/80 to-[#e6ecf5]/80 backdrop-blur-sm border border-[#c8d5f0]'
        }`}>
          <h2 className="text-xl font-bold mb-2">No Planet Selected</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>Discover planets with the telescope to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${
      isDarkMode ? 'text-white' : 'text-slate-800'
    }`}>
      {/* Planet Visual */}
      <div className={`w-64 h-64 rounded-full flex items-center justify-center border-2 shadow-2xl ${
        isDarkMode 
          ? 'bg-blue-900/30 border-blue-400/50 shadow-blue-500/20' 
          : 'bg-gradient-to-br from-[#dbe7f5] to-[#b8c5e0] border-[#9bb3d1] shadow-indigo-300/30'
      }`}>
        <div className={`w-56 h-56 rounded-full flex items-center justify-center ${
          isDarkMode 
            ? 'bg-blue-800/50' 
            : 'bg-gradient-to-br from-[#c8d5f0] to-[#a5b8d1]'
        }`}>
          <div className={`w-48 h-48 rounded-full animate-pulse ${
            isDarkMode 
              ? 'bg-blue-700/50' 
              : 'bg-gradient-to-br from-[#b8c5e0] to-[#9bb3d1]'
          }`}></div>
        </div>
      </div>

      {/* Planet Info */}
      <div className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-full p-4 rounded-lg backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-black/30' 
          : 'bg-gradient-to-br from-[#f0f4ff]/90 to-[#e6ecf5]/90 border border-[#c8d5f0]'
      }`}>
        <h2 className="text-2xl font-bold">{planet.content || `TIC ${planet.id}`}</h2>
      </div>
      
      <div className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-full p-4 rounded-lg backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-black/30' 
          : 'bg-gradient-to-br from-[#f0f4ff]/90 to-[#e6ecf5]/90 border border-[#c8d5f0]'
      }`}>
        <h3 className="text-lg font-semibold mb-2">Planet Stats</h3>
        <ul className={`text-sm space-y-1 ${
          isDarkMode ? '' : 'text-slate-700'
        }`}>
          <li>Temperature: {planet.stats?.temperature || 'N/A'} K</li>
          <li>Radius: {planet.stats?.radius || 'N/A'} R☉</li>
          {planet.stats?.metallicity && (
            <li className="text-xs">
              <span className={isDarkMode ? 'text-blue-300' : 'text-blue-600'}>
                Metallicity [Fe/H]: {planet.stats.metallicity}
              </span>
              <br />
              <span className={`text-xs italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {interpretMetallicity(planet.stats.metallicity)}
              </span>
            </li>
          )}
          <li>Mass: {planet.stats?.mass || 'N/A'} M☉</li>
        </ul>
      </div>

      {/* Navigation */}
      <Button 
        onClick={onPrev} 
        disabled={isFirst}
        className={`absolute left-8 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 disabled:opacity-30 ${
          isDarkMode 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gradient-to-br from-[#e6ecf5]/80 to-[#d4dff0]/80 hover:from-[#d4dff0]/90 hover:to-[#c8d5f0]/90 text-slate-800 border border-[#b8c5e0]'
        }`}
      >
        &lt;
      </Button>
      <Button 
        onClick={onNext} 
        disabled={isLast}
        className={`absolute right-8 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 disabled:opacity-30 ${
          isDarkMode 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gradient-to-br from-[#e6ecf5]/80 to-[#d4dff0]/80 hover:from-[#d4dff0]/90 hover:to-[#c8d5f0]/90 text-slate-800 border border-[#b8c5e0]'
        }`}
      >
        &gt;
      </Button>
    </div>
  );
};

export default PlanetFocusView;
