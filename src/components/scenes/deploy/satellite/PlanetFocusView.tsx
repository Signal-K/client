"use client"

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Info } from 'lucide-react';
import Link from 'next/link';
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

// Helper function to calculate planet type based on density and radius
function calculatePlanetType(density: string | number | null | undefined, radius: string | number | null | undefined): string {
  if (!density || density === "N/A" || !radius || radius === "N/A") return "Unknown";
  
  const densityVal = typeof density === 'string' ? parseFloat(density) : density;
  const radiusVal = typeof radius === 'string' ? parseFloat(radius) : radius;
  
  if (isNaN(densityVal) || isNaN(radiusVal)) return "Unknown";
  
  // Density thresholds (g/cm³):
  // Gaseous planets (Jupiter-like): < 2 g/cm³
  // Ice giants (Neptune-like): 1.5 - 2.5 g/cm³
  // Terrestrial (Earth-like): > 3 g/cm³
  // Rocky/Iron-rich: > 5 g/cm³
  
  // Also consider radius (Earth radii):
  // Small terrestrial: < 2 R⊕
  // Super-Earth: 2-4 R⊕
  // Neptune-like: 4-8 R⊕
  // Jupiter-like: > 8 R⊕
  
  if (densityVal < 1.5) {
    return "Gaseous Giant";
  } else if (densityVal < 2.5) {
    if (radiusVal > 4) {
      return "Ice Giant";
    }
    return "Gaseous";
  } else if (densityVal < 4) {
    if (radiusVal < 2) {
      return "Terrestrial";
    }
    return "Super-Earth (Terrestrial)";
  } else {
    return "Rocky Terrestrial";
  }
}

const PlanetFocusView: React.FC<PlanetFocusViewProps> = ({ planet, onNext, onPrev, isFirst, isLast, isDarkMode = true }) => {
  console.log('🎨 PlanetFocusView render:', planet?.id, 'stats:', planet?.stats);
  const [showInfoTooltip, setShowInfoTooltip] = useState<string | null>(null);
  
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

  const planetType = calculatePlanetType(planet.stats?.density, planet.stats?.radius);
  const hasClassificationInfo = planet.stats?.classificationId && planet.stats?.classificationAuthor;

  const InfoButton: React.FC<{ stat: string }> = ({ stat }) => {
    if (!hasClassificationInfo) return null;
    
    return (
      <button
        className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors ${
          isDarkMode
            ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300'
            : 'bg-blue-200 hover:bg-blue-300 text-blue-700'
        }`}
        onClick={() => setShowInfoTooltip(showInfoTooltip === stat ? null : stat)}
        onMouseEnter={() => setShowInfoTooltip(stat)}
        onMouseLeave={() => setShowInfoTooltip(null)}
      >
        <Info className="w-3 h-3" />
      </button>
    );
  };

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

      {/* Planet Info - Positioned above planet */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[200px] p-4 rounded-lg backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-black/30' 
          : 'bg-gradient-to-br from-[#f0f4ff]/90 to-[#e6ecf5]/90 border border-[#c8d5f0]'
      }`}>
        <h2 className="text-2xl font-bold">{planet.content || `TIC ${planet.id}`}</h2>
      </div>
      
      {/* Planet Stats - Positioned below planet */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[150px] p-4 rounded-lg backdrop-blur-sm max-w-sm ${
        isDarkMode 
          ? 'bg-black/30' 
          : 'bg-gradient-to-br from-[#f0f4ff]/90 to-[#e6ecf5]/90 border border-[#c8d5f0]'
      }`}>
        <h3 className="text-lg font-semibold mb-2">Planet Stats</h3>
        <ul className={`text-sm space-y-1 ${
          isDarkMode ? '' : 'text-slate-700'
        }`}>
          {/* Planet Type */}
          {planetType !== "Unknown" && (
            <li className="flex items-center">
              <span className="font-semibold mr-1">Type:</span> {planetType}
              {hasClassificationInfo && <InfoButton stat="type" />}
            </li>
          )}
          
          {/* Temperature */}
          {planet.stats?.temperature && planet.stats.temperature !== "N/A" && (
            <li className="flex items-center">
              Temperature: {planet.stats.temperature} K
              {hasClassificationInfo && <InfoButton stat="temperature" />}
            </li>
          )}
          
          {/* Radius */}
          {planet.stats?.radius && planet.stats.radius !== "N/A" && (
            <li className="flex items-center">
              Radius: {planet.stats.radius} R☉
              {hasClassificationInfo && <InfoButton stat="radius" />}
            </li>
          )}
          
          {/* Density */}
          {planet.stats?.density && planet.stats.density !== "N/A" && (
            <li className="flex items-center">
              Density: {planet.stats.density} g/cm³
              {hasClassificationInfo && <InfoButton stat="density" />}
            </li>
          )}
          
          {/* Metallicity */}
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
          
          {/* Mass */}
          {planet.stats?.mass && planet.stats.mass !== "N/A" && (
            <li className="flex items-center">
              Mass: {planet.stats.mass} M☉
              {hasClassificationInfo && <InfoButton stat="mass" />}
            </li>
          )}
        </ul>
        
        {/* Info Tooltip */}
        {showInfoTooltip && hasClassificationInfo && planet.stats && (
          <div className={`mt-3 p-2 rounded text-xs border ${
            isDarkMode
              ? 'bg-gray-800/90 border-gray-700 text-gray-300'
              : 'bg-white/90 border-gray-300 text-gray-700'
          }`}>
            <p className="mb-1">Measured by classification #{planet.stats.classificationId}</p>
            <Link 
              href={`/posts/${planet.stats.classificationId}`}
              className={`underline ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              View classification →
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Button 
        onClick={onPrev} 
        disabled={isFirst}
        data-tutorial="planet-nav-prev"
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
        data-tutorial="planet-nav-next"
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
