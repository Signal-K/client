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
};

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
}) => {
  const containerClasses = isMobile
    ? "w-full bg-[#181e2a]/95 backdrop-blur-md p-4 rounded-t-xl border-t border-[#232b3b] text-white min-h-80 max-h-96 overflow-y-auto"
    : "flex flex-col h-full min-h-0 w-full max-w-full z-30 bg-[#10141c] border-l border-[#232b3b] p-6 text-white";

  return (
    <div className={containerClasses}>
      <div className={`flex-grow ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
        <div className="text-center">
            <Satellite className={`mx-auto text-blue-400 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
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
            <h3 className="text-lg font-semibold">Reward Preview</h3>
            <div className="mt-2 p-4 bg-gray-800/50 rounded-lg text-sm">
                <p>Deploying for <span className="font-bold">{duration} days</span> on the <span className="font-bold">{investigationMode}</span> mission will yield approximately:</p>
                <ul className="list-disc list-inside mt-2">
                    <li>{duration * 10} Research Points</li>
                    <li>{Math.floor(duration / 5)} Discovery Credits</li>
                </ul>
                {investigationMode === 'weather' && (
                  <>
                    {cloudInvestigationDescription && <p className="mt-2 text-xs italic">{cloudInvestigationDescription}</p>}
                    <p className="mt-2 text-xs">Cloud Classifications: {userCloudClassifications}</p>
                  </>
                )}
                {investigationMode === 'p-4' && (
                  <>
                    <p className='mt-2 text-xs'>Sublimation & surface spider anomalies</p>
                  </>
                )}
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
