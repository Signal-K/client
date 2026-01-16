"use client"

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Slider } from '@/src/components/ui/slider';
import { Satellite } from 'lucide-react';

interface DeploySidebarProps {
  investigationMode: 'weather' | 'planets' | 'p-4';
  setInvestigationMode: (mode: 'weather' | 'planets' | 'p-4') => void;
  duration: number;
  setDuration: (days: number) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  isMobile?: boolean;
  cloudInvestigationDescription?: string;
  userCloudClassifications?: number;
  isDeployDisabled?: boolean;
  deploymentWarning?: string | null;
  isFastDeployEnabled?: boolean | null;
  isDarkMode?: boolean;
  probeThresholdWarning?: string | null;
  waterDiscoveryStatus?: {
    hasCloudClassifications: boolean;
    hasValidStats: boolean;
    canDiscoverMinerals: boolean;
  };
}

const DeploySidebar: React.FC<DeploySidebarProps> = ({
  investigationMode,
  setInvestigationMode,
  duration,
  setDuration,
  onDeploy,
  isDeploying,
  isMobile = false,
  cloudInvestigationDescription,
  userCloudClassifications,
  isDeployDisabled = false,
  deploymentWarning = null,
  isFastDeployEnabled = null,
  isDarkMode = true,
  probeThresholdWarning = null,
  waterDiscoveryStatus = {
    hasCloudClassifications: false,
    hasValidStats: false,
    canDiscoverMinerals: false,
  },
}) => {
  const containerClasses = isMobile
    ? `w-full backdrop-blur-md p-2.5 rounded-t-xl border-t shadow-2xl ${
        isDarkMode 
          ? "bg-[#181e2a]/95 border-[#232b3b] text-white" 
          : "bg-gradient-to-br from-[#f0f4ff]/95 to-[#e6ecf5]/95 border-[#9bb3d1] text-slate-800"
      }`
    : `flex flex-col h-full min-h-0 w-full max-w-full z-30 border-l p-3 sm:p-4 overflow-y-auto ${
        isDarkMode 
          ? "bg-[#10141c] border-[#232b3b] text-white" 
          : "bg-gradient-to-b from-[#f0f4ff] via-[#f5f8ff] to-[#e8eeff] border-[#9bb3d1] text-slate-800"
      }`;

  return (
    <div className={containerClasses}>
      {/* Scroll indicator for mobile - visual cue */}
      {isMobile && (
        <div className="flex justify-center mb-2">
          <div className={`w-12 h-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
        </div>
      )}

      {/* Deploy Button - MOVED TO TOP */}
      <div className={`${isMobile ? 'mb-2 pb-2 border-b' : 'mb-3 sm:mb-4 pb-3 sm:pb-4 border-b'} ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
        {deploymentWarning && (
          <p className={`text-red-500 text-center mb-1.5 sm:mb-2 leading-snug ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{deploymentWarning}</p>
        )}
        {!isDeployDisabled && (
          <Button 
            onClick={onDeploy} 
            disabled={isDeploying}
            data-tutorial="deploy-satellite"
            className={`w-full ${isMobile ? 'h-9 text-sm' : 'h-11'} font-bold text-base shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-500/50 hover:shadow-blue-500/70'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-600/40 hover:shadow-blue-700/60'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
          >
            {isDeploying ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deploying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Satellite className="w-5 h-5" />
                Deploy Satellite
              </span>
            )}
          </Button>
        )}
      </div>
      
      <div className={`flex-grow ${isMobile ? 'space-y-2 max-h-[50vh] overflow-y-auto' : 'space-y-3 sm:space-y-4'}`}>
        <div className="text-center">
            <Satellite className={`mx-auto ${
              isDarkMode ? 'text-blue-400' : 'text-indigo-700'
            } ${isMobile ? 'h-5 w-5' : 'h-8 w-8 sm:h-10 sm:w-10'}`} />
            <h2 className={`font-bold mt-1 ${isMobile ? 'text-sm' : 'text-base sm:text-lg'}`}>Satellite Controls</h2>
        </div>

        {/* Mission Selection */}
        <div>
          <label htmlFor="mission-select" className={`block font-medium mb-1.5 ${isMobile ? 'text-xs' : 'text-sm'}`}>Mission</label>
          <Select
            value={investigationMode}
            onValueChange={(value: 'weather' | 'planets' | 'p-4') => setInvestigationMode(value)}
          >
            <SelectTrigger id="mission-select" className={isMobile ? 'h-9 text-sm' : ''}>
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weather">Weather Analysis</SelectItem>
              <SelectItem value="planets">Planetary Survey</SelectItem>
              <SelectItem value="p-4">Wind Survey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fast Deploy Welcome Message */}
        {isFastDeployEnabled === true && (
          <div className={`p-2.5 sm:p-4 bg-gradient-to-br from-green-500/25 to-blue-500/25 rounded-lg border border-green-400/40 shadow-lg ${isMobile ? 'text-xs' : ''}`}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className={`text-green-300 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>🎁 Welcome Gift Active!</span>
            </div>
            <p className={`text-green-200 leading-snug ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              🚀 As a new explorer, your satellite has a <strong>speed boost</strong>! 
              Anomalies available <strong>immediately</strong>.
            </p>
          </div>
        )}

        {/* Probe Threshold Warning */}
        {probeThresholdWarning && (
          <div className={`p-2.5 sm:p-4 bg-gradient-to-br from-orange-500/25 to-red-500/25 rounded-lg border border-orange-400/40 shadow-lg ${isMobile ? 'text-xs' : ''}`}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className={`text-orange-300 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>⚠️ Mission Alert</span>
            </div>
            <p className={`text-orange-200 leading-snug ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {probeThresholdWarning}
            </p>
          </div>
        )}

        {/* Water/Mineral Discovery Message */}
        {(waterDiscoveryStatus.canDiscoverMinerals || waterDiscoveryStatus.hasCloudClassifications || waterDiscoveryStatus.hasValidStats) && (
          <div className={`p-2.5 sm:p-4 ${
            waterDiscoveryStatus.canDiscoverMinerals 
              ? isDarkMode
                ? 'bg-gradient-to-br from-red-500/25 to-orange-500/25 border-red-400/40'
                : 'bg-gradient-to-br from-red-100 to-orange-100 border-red-400/60'
              : isDarkMode
                ? 'bg-gradient-to-br from-yellow-500/25 to-amber-500/25 border-yellow-400/40'
                : 'bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-500/60'
          } rounded-lg border shadow-lg ${isMobile ? 'text-xs' : ''}`}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${
                waterDiscoveryStatus.canDiscoverMinerals 
                  ? isDarkMode ? 'bg-red-400' : 'bg-red-600'
                  : isDarkMode ? 'bg-yellow-400' : 'bg-yellow-600'
              } rounded-full animate-pulse`}></div>
              <span className={`${
                waterDiscoveryStatus.canDiscoverMinerals 
                  ? isDarkMode ? 'text-red-300' : 'text-red-700'
                  : isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
              } font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {waterDiscoveryStatus.canDiscoverMinerals 
                  ? '💧 Water & Minerals Detected!' 
                  : '🔍 Resource Discovery Progress'}
              </span>
            </div>
            <div className={`${
              waterDiscoveryStatus.canDiscoverMinerals 
                ? isDarkMode ? 'text-red-200' : 'text-red-800'
                : isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
            } leading-snug ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {waterDiscoveryStatus.canDiscoverMinerals ? (
                <p>
                  🌊 Based on your cloud discoveries, this planet shows signs of <strong>water vapor</strong> and <strong>trace minerals</strong>. 
                  The satellite can now locate these resources for extraction and analysis.
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold">Requirements for mineral discovery:</p>
                  <ul className="list-none space-y-0.5 ml-2">
                    <li className="flex items-center gap-1.5">
                      {waterDiscoveryStatus.hasValidStats ? '✅' : '❌'}
                      <span>Planet statistics calculated (density, radius, mass)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      {waterDiscoveryStatus.hasCloudClassifications ? '✅' : '❌'}
                      <span>Cloud formations discovered on this planet</span>
                    </li>
                  </ul>
                  {!waterDiscoveryStatus.hasValidStats && (
                    <p className="mt-1.5 italic text-xs">
                      💡 Deploy a <strong>Planetary Survey</strong> satellite to calculate planet statistics.
                    </p>
                  )}
                  {!waterDiscoveryStatus.hasCloudClassifications && (
                    <p className="mt-1.5 italic text-xs">
                      💡 Deploy a <strong>Weather Analysis</strong> satellite to discover clouds.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Duration Slider */}
        <div>
            <label htmlFor="duration-slider" className={`block font-medium mb-1.5 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Duration: <span className="font-bold text-blue-400">{duration} days</span>
            </label>
            <Slider
                id="duration-slider"
                min={1}
                max={30}
                step={1}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                className={isMobile ? 'h-1' : ''}
            />
        </div>

        {/* Reward Preview */}
        <div>
            <h3 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>Mission Preview</h3>
            <div className={`mt-1.5 sm:mt-2 p-2 sm:p-3 bg-gray-800/50 rounded-lg ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <p className="leading-snug">Deploying for <span className="font-bold">{duration} days</span> on <span className="font-bold">{investigationMode}</span>:</p>
                
                {investigationMode === 'weather' && (
                  <div className={`mt-2 sm:mt-3 ${isMobile ? 'space-y-1' : ''}`}>
                    <h4 className={`font-semibold text-blue-400 mb-1.5 sm:mb-2 ${isMobile ? 'text-xs' : ''}`}>Weather Analysis</h4>
                    <ul className={`list-disc list-inside space-y-0.5 sm:space-y-1 ${isMobile ? 'text-[10px]' : 'text-xs'} leading-snug`}>
                      <li>Discover cloud formations on exoplanets</li>
                      <li className="hidden sm:list-item">Analyze atmospheric patterns</li>
                      <li>Contribute to planetary atmosphere understanding</li>
                    </ul>
                    {cloudInvestigationDescription && <p className={`mt-1.5 sm:mt-2 italic ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{cloudInvestigationDescription}</p>}
                    {!isMobile && <p className="mt-1.5 sm:mt-2 text-xs">Your cloud classifications: {userCloudClassifications}</p>}
                  </div>
                )}
                
                {investigationMode === 'planets' && (
                  <div className={`mt-2 sm:mt-3 ${isMobile ? 'space-y-1' : ''}`}>
                    <h4 className={`font-semibold text-blue-400 mb-1.5 sm:mb-2 ${isMobile ? 'text-xs' : ''}`}>Planetary Survey</h4>
                    <ul className={`list-disc list-inside space-y-0.5 sm:space-y-1 ${isMobile ? 'text-[10px]' : 'text-xs'} leading-snug`}>
                      <li>Deploy satellites to discovered planets</li>
                      <li>Calculate planet physical properties</li>
                      <li className="hidden sm:list-item">Analyze planetary temperatures</li>
                      <li>Conduct in-depth planetary studies</li>
                    </ul>
                  </div>
                )}
                
                {investigationMode === 'p-4' && (
                  <div className={`mt-2 sm:mt-3 ${isMobile ? 'space-y-1' : ''}`}>
                    <h4 className={`font-semibold text-blue-400 mb-1.5 sm:mb-2 ${isMobile ? 'text-xs' : ''}`}>Wind Survey (Planet Four)</h4>
                    <ul className={`list-disc list-inside space-y-0.5 sm:space-y-1 ${isMobile ? 'text-[10px]' : 'text-xs'} leading-snug`}>
                      <li>Identify surface features on Mars</li>
                      <li>Track seasonal changes</li>
                      <li className="hidden sm:list-item">Classify sublimation patterns</li>
                      <li>Expected: Surface spiders, fan formations</li>
                    </ul>
                  </div>
                )}
                
                {!isMobile && (
                  <p className="mt-2 sm:mt-3 text-xs text-gray-400 leading-snug">
                    Duration affects variety and number of anomalies.
                  </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeploySidebar;
