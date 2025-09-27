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
}) => {
  const containerClasses = isMobile
    ? `w-full backdrop-blur-md p-4 rounded-t-xl border-t min-h-80 max-h-96 overflow-y-auto ${
        isDarkMode 
          ? "bg-[#181e2a]/95 border-[#232b3b] text-white" 
          : "bg-gradient-to-br from-[#f0f4ff]/95 to-[#e6ecf5]/95 border-[#9bb3d1] text-slate-800"
      }`
    : `flex flex-col h-full min-h-0 w-full max-w-full z-30 border-l p-6 ${
        isDarkMode 
          ? "bg-[#10141c] border-[#232b3b] text-white" 
          : "bg-gradient-to-b from-[#f0f4ff] via-[#f5f8ff] to-[#e8eeff] border-[#9bb3d1] text-slate-800"
      }`;

  return (
    <div className={containerClasses}>
      <div className={`flex-grow ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
        <div className="text-center">
            <Satellite className={`mx-auto ${
              isDarkMode ? 'text-blue-400' : 'text-indigo-700'
            } ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
            <h2 className={`font-bold mt-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>Satellite Controls</h2>
        </div>

        {/* Mission Selection */}
        <div>
          <label htmlFor="mission-select" className="block text-sm font-medium mb-2">Mission</label>
          <Select
            value={investigationMode}
            onValueChange={(value: 'weather' | 'planets' | 'p-4') => setInvestigationMode(value)}
          >
            <SelectTrigger id="mission-select">
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
          <div className="p-4 bg-gradient-to-br from-green-500/25 to-blue-500/25 rounded-lg border border-green-400/40 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-semibold text-sm">🎁 Welcome Gift Active!</span>
            </div>
            <p className="text-green-200 text-xs leading-relaxed">
              🚀 As a new space explorer, your satellite will experience a <strong>speed boost</strong>! 
              Anomalies will be made available for classification <strong>immediately</strong> instead of 
              waiting for the usual deployment time. Enjoy your first mission!
            </p>
          </div>
        )}

        {/* Duration Slider */}
        <div>
            <label htmlFor="duration-slider" className="block text-sm font-medium mb-2">
                Duration: <span className="font-bold text-blue-400">{duration} days</span>
            </label>
            <Slider
                id="duration-slider"
                min={1}
                max={30}
                step={1}
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
            />
        </div>

        {/* Reward Preview */}
        <div>
            <h3 className="text-lg font-semibold">Mission Preview</h3>
            <div className="mt-2 p-4 bg-gray-800/50 rounded-lg text-sm">
                <p>Deploying for <span className="font-bold">{duration} days</span> on the <span className="font-bold">{investigationMode}</span> mission:</p>
                
                {investigationMode === 'weather' && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-blue-400 mb-2">Weather Analysis Mission</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Discover and classify cloud formations on exoplanets</li>
                      <li>Analyze atmospheric patterns and weather systems</li>
                      <li>Contribute to understanding planetary atmospheres</li>
                      <li>Expected anomalies: Cloud formations, atmospheric disturbances</li>
                    </ul>
                    {cloudInvestigationDescription && <p className="mt-2 text-xs italic">{cloudInvestigationDescription}</p>}
                    <p className="mt-2 text-xs">Your cloud classifications: {userCloudClassifications}</p>
                  </div>
                )}
                
                {investigationMode === 'planets' && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-blue-400 mb-2">Planetary Survey Mission</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Deploy satellites to previously discovered planets</li>
                      <li>Calculate detailed planet physical properties (radius, mass, density)</li>
                      <li>Analyze planetary temperatures and atmospheric compositions</li>
                      <li>Conduct in-depth studies of confirmed planetary systems</li>
                      <li>Expected data: Detailed planetary measurements and characteristics</li>
                    </ul>
                  </div>
                )}
                
                {investigationMode === 'p-4' && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-blue-400 mb-2">Wind Survey Mission (Planet Four)</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Identify surface features on Mars and similar planets</li>
                      <li>Track seasonal changes and surface evolution</li>
                      <li>Classify sublimation patterns and surface formations</li>
                      <li>Expected anomalies: Sublimation features, surface spiders, fan formations</li>
                    </ul>
                  </div>
                )}
                
                <p className="mt-3 text-xs text-gray-400">
                  Duration affects the variety and number of anomalies you'll encounter.
                </p>
            </div>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="mt-6">
        {deploymentWarning && (
          <p className="text-red-500 text-sm text-center mb-4">{deploymentWarning}</p>
        )}
        {!isDeployDisabled && (
          <Button onClick={onDeploy} disabled={isDeploying} className="w-full">
            {isDeploying ? 'Deploying...' : 'Deploy Satellite'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeploySidebar;
