"use client"

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Telescope, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Target, Sun, Crosshair, ArrowLeft, Zap, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateSectorName } from '@/src/components/classification/telescope/utils/sector-utils';
import type { Anomaly } from '@/types/Structures/telescope';
import type { DeploymentType } from '../TelescopeViewportRange';

interface TelescopeDeploySidebarProps {
  deploymentType: DeploymentType | null;
  currentSector: { x: number; y: number };
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  sectorAnomalies: Anomaly[];
  selectedSector: { x: number; y: number } | null;
  onSelectSector: () => void;
  onDeploy: () => void;
  isDeploying: boolean;
  alreadyDeployed: boolean;
  deploymentMessage: string | null;
  onBackToTypeSelection: () => void;
  isMobile?: boolean;
  isDarkMode?: boolean;
  tessAnomaliesCount: number;
}

const TelescopeDeploySidebar: React.FC<TelescopeDeploySidebarProps> = ({
  deploymentType,
  currentSector,
  onMove,
  sectorAnomalies,
  selectedSector,
  onSelectSector,
  onDeploy,
  isDeploying,
  alreadyDeployed,
  deploymentMessage,
  onBackToTypeSelection,
  isMobile = false,
  isDarkMode = true,
  tessAnomaliesCount,
}) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = React.useState(false);

  const containerClasses = isMobile
    ? `w-full backdrop-blur-md p-2 rounded-t-xl border-t shadow-2xl max-h-[65vh] ${
        isDarkMode 
          ? "bg-[#002439]/95 border-[#78cce2]/30 text-white" 
          : "bg-gradient-to-br from-[#f0f4ff]/95 to-[#e6ecf5]/95 border-[#9bb3d1] text-slate-800"
      }`
    : `flex flex-col h-full min-h-0 w-full max-w-full z-30 border-l p-3 sm:p-4 overflow-y-auto ${
        isDarkMode 
          ? "bg-[#002439]/95 border-[#78cce2]/30 text-white" 
          : "bg-gradient-to-b from-[#f0f4ff] via-[#f5f8ff] to-[#e8eeff] border-[#9bb3d1] text-slate-800"
      }`;

  const sectorName = generateSectorName(currentSector.x, currentSector.y);

  return (
    <div className={containerClasses}>
      {/* Scroll indicator for mobile */}
      {isMobile && (
        <div className="flex justify-center mb-2">
          <div className={`w-12 h-1 rounded-full ${isDarkMode ? 'bg-[#78cce2]/40' : 'bg-gray-400'}`}></div>
        </div>
      )}

      {/* Deploy Button - TOP PRIORITY */}
      <div className={`${isMobile ? 'mb-1.5 pb-1.5 border-b' : 'mb-3 sm:mb-4 pb-3 sm:pb-4 border-b'} ${
        isDarkMode ? 'border-[#78cce2]/30' : 'border-gray-300'
      }`}>
        {deploymentMessage && (
          <p className={`${
            alreadyDeployed 
              ? 'text-orange-400' 
              : isDarkMode ? 'text-[#78cce2]' : 'text-indigo-600'
          } text-center mb-1 leading-snug ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
            {deploymentMessage}
          </p>
        )}
        
        {!selectedSector && sectorAnomalies.length > 0 && (
          <Button
            onClick={onSelectSector}
            className={`w-full ${isMobile ? 'h-8 text-xs px-2' : 'h-11'} font-bold shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#4e7988] to-[#78cce2] hover:from-[#78cce2] hover:to-[#a8dce8] text-[#002439]'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white'
            } hover:scale-[1.02] active:scale-[0.98]`}
          >
            <Target className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 sm:w-5 sm:h-5 mr-2'}`} />
            Select Sector
          </Button>
        )}
        
        {selectedSector && (
          <Button 
            onClick={onDeploy} 
            disabled={alreadyDeployed || isDeploying} 
            className={`w-full ${isMobile ? 'h-8 text-xs px-2' : 'h-11'} font-bold shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#78cce2] to-[#a8dce8] hover:from-[#a8dce8] hover:to-[#c8e8ed] text-[#002439] shadow-[#78cce2]/50 hover:shadow-[#78cce2]/70'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-600/40 hover:shadow-blue-700/60'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
          >
            {isDeploying ? (
              <span className="flex items-center gap-1.5">
                <div className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
                Deploying...
              </span>
            ) : alreadyDeployed ? (
              'Already Deployed'
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Zap className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4 sm:w-5 sm:h-5'}`} />
                Deploy Telescope
              </span>
            )}
          </Button>
        )}

        {sectorAnomalies.length === 0 && !selectedSector && (
          <div className={`text-center py-1.5 px-2 rounded-lg ${
            isDarkMode ? 'bg-[#005066]/30 text-[#78cce2]' : 'bg-gray-100 text-gray-600'
          } ${isMobile ? 'text-[9px]' : 'text-xs sm:text-sm'}`}>
            No targets in current sector
          </div>
        )}
      </div>
      
      <div className={`flex-grow ${isMobile ? 'space-y-1.5 max-h-[45vh] overflow-y-auto' : 'space-y-3 sm:space-y-4'}`}>
        {/* Header */}
        <div className="text-center">
          <div className={`flex items-center justify-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className={`${isMobile ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} ${
                isDarkMode ? 'text-[#78cce2] hover:bg-[#78cce2]/20' : 'text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <ArrowLeft className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Telescope className={`${
              isDarkMode ? 'text-[#78cce2]' : 'text-indigo-700'
            } ${isMobile ? 'h-4 w-4' : 'h-8 w-8 sm:h-10 sm:w-10'}`} />
          </div>
          <h2 className={`font-bold ${isMobile ? 'text-xs' : 'text-base sm:text-lg'} ${
            isDarkMode ? 'text-[#e4eff0]' : 'text-slate-800'
          }`}>
            Telescope Controls
          </h2>
        </div>

        {/* Mission Type Display */}
        {deploymentType && (
          <div className={`${isMobile ? 'p-1.5' : 'p-2.5 sm:p-3'} rounded-lg border ${
            isDarkMode 
              ? 'bg-[#005066]/30 border-[#78cce2]/30' 
              : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className={`flex items-center gap-1.5 ${isMobile ? 'mb-1' : 'mb-1.5'}`}>
              {deploymentType === "stellar" ? (
                <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#e55555] flex items-center justify-center`}>
                  <Sun className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-white`} />
                </div>
              ) : (
                <div className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-gradient-to-br from-[#78cce2] to-[#4e7988] flex items-center justify-center`}>
                  <Crosshair className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} text-[#002439]`} />
                </div>
              )}
              <span className={`font-semibold ${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} ${
                isDarkMode ? 'text-[#e4eff0]' : 'text-slate-800'
              }`}>
                {deploymentType === "stellar" ? "Stellar Objects" : "Planetary Objects"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToTypeSelection}
              className={`w-full ${isMobile ? 'h-6 text-[9px] px-1' : 'h-8 text-sm'} ${
                isDarkMode 
                  ? 'text-[#78cce2] hover:bg-[#78cce2]/20' 
                  : 'text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              Change Mission Type
            </Button>
          </div>
        )}

        {/* Sector Navigation */}
        <div>
          <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
            <label className={`block font-medium ${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} ${
              isDarkMode ? 'text-[#e4eff0]' : 'text-slate-800'
            }`}>
              Sector Navigation
            </label>
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className={`h-7 w-7 p-0 ${
                  isDarkMode ? 'text-[#78cce2] hover:bg-[#78cce2]/20' : 'text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Info Panel */}
          {showInfo && !isMobile && (
            <div className={`mb-3 p-2.5 rounded-lg ${
              isDarkMode ? 'bg-[#005066]/30 border border-[#78cce2]/20' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-xs ${
                isDarkMode ? 'text-[#78cce2]' : 'text-indigo-700'
              } leading-relaxed`}>
                Navigate through space sectors to find exoplanet candidates. Each sector may contain multiple targets.
                You can also drag the star field directly to explore.
              </p>
            </div>
          )}

          {/* D-Pad Controls */}
          <div className={`grid grid-cols-3 gap-1.5 ${isMobile ? 'max-w-[200px]' : 'max-w-xs'} mx-auto ${isMobile ? 'mb-1.5' : 'mb-3'}`}>
            <div></div>
            <Button
              variant="ghost"
              onClick={() => onMove('up')}
              className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} p-0 ${
                isDarkMode 
                  ? 'text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30' 
                  : 'text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              <ChevronUp className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
            <div></div>
            <Button
              variant="ghost"
              onClick={() => onMove('left')}
              className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} p-0 ${
                isDarkMode 
                  ? 'text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30' 
                  : 'text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
            <div className={`${isMobile ? 'h-8 w-8 text-[9px]' : 'h-12 w-12 text-xs'} flex items-center justify-center font-mono rounded ${
              isDarkMode ? 'bg-[#78cce2]/10 border border-[#78cce2]/20 text-[#78cce2]' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            }`}>
              {currentSector.x},{currentSector.y}
            </div>
            <Button
              variant="ghost"
              onClick={() => onMove('right')}
              className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} p-0 ${
                isDarkMode 
                  ? 'text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30' 
                  : 'text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
            <div></div>
            <Button
              variant="ghost"
              onClick={() => onMove('down')}
              className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} p-0 ${
                isDarkMode 
                  ? 'text-[#78cce2] hover:bg-[#78cce2]/20 border border-[#78cce2]/30' 
                  : 'text-indigo-600 hover:bg-indigo-100 border border-indigo-300'
              }`}
            >
              <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </Button>
            <div></div>
          </div>

          {/* Current Sector Info */}
          <div className={`${isMobile ? 'p-1.5' : 'p-2.5 sm:p-3'} rounded-lg ${
            isDarkMode ? 'bg-[#002439]/50' : 'bg-gray-50'
          }`}>
            <div className={`font-semibold ${isMobile ? 'text-[10px] mb-0.5' : 'text-xs sm:text-sm mb-1'} ${
              isDarkMode ? 'text-[#e4eff0]' : 'text-slate-800'
            }`}>
              {sectorName}
            </div>
            <div className={`${isMobile ? 'text-[9px]' : 'text-[10px] sm:text-xs'} ${
              isDarkMode ? 'text-[#78cce2]' : 'text-slate-600'
            }`}>
              <span className="font-mono">({currentSector.x}, {currentSector.y})</span>
              {' • '}
              <span className={sectorAnomalies.length > 0 ? (isDarkMode ? 'text-[#78cce2]' : 'text-indigo-600') : ''}>
                {sectorAnomalies.length} {sectorAnomalies.length === 1 ? 'target' : 'targets'}
              </span>
            </div>
            {selectedSector && (
              <div className={`mt-1 ${isMobile ? 'text-[9px]' : 'text-[10px] sm:text-xs'} ${
                isDarkMode ? 'text-[#f2c572]' : 'text-orange-600'
              } font-medium`}>
                ✓ Sector selected - ready to deploy
              </div>
            )}
          </div>
        </div>

        {/* Mission Overview - Condensed on mobile */}
        {!isMobile && (
          <div>
            <h3 className={`font-semibold text-base mb-2 ${
              isDarkMode ? 'text-[#e4eff0]' : 'text-slate-800'
            }`}>
              Mission Overview
            </h3>
            <div className={`p-2 sm:p-3 rounded-lg ${
              isDarkMode ? 'bg-[#005066]/30' : 'bg-indigo-50'
            } text-sm`}>
              <div className={`leading-snug ${isDarkMode ? 'text-[#e4eff0]' : 'text-slate-700'}`}>
                <p className="mb-2">
                  Deploying telescope in <span className="font-bold">{sectorName}</span>:
                </p>
                
                <ul className={`list-disc list-inside space-y-0.5 sm:space-y-1 text-xs ${
                  isDarkMode ? 'text-[#78cce2]' : 'text-slate-600'
                }`}>
                  {deploymentType === 'stellar' ? (
                    <>
                      <li>Monitor stellar objects and stars</li>
                      <li>Detect stellar anomalies</li>
                      <li className="hidden sm:list-item">Analyze stellar brightness patterns</li>
                      <li>Contribute to stellar science</li>
                    </>
                  ) : (
                    <>
                      <li>Search for exoplanet transits</li>
                      <li>Confirm planetary candidates</li>
                      <li className="hidden sm:list-item">Monitor brightness variations</li>
                      <li>Help discover new worlds</li>
                    </>
                  )}
                </ul>
              </div>

              <div className={`mt-3 pt-2 border-t ${
                isDarkMode ? 'border-[#78cce2]/20' : 'border-indigo-200'
              }`}>
                <div className={`text-xs ${isDarkMode ? 'text-[#78cce2]' : 'text-slate-600'}`}>
                  Total candidates: <span className="font-bold">{tessAnomaliesCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelescopeDeploySidebar;
