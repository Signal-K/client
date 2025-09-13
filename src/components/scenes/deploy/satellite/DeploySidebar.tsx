"use client"

import React from 'react';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Slider } from '@/src/components/ui/slider';
import { Satellite } from 'lucide-react';

interface DeploySidebarProps {
  investigationMode: 'weather' | 'planets';
  setInvestigationMode: (mode: 'weather' | 'planets') => void;
  duration: number;
  setDuration: (days: number) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  isMobile?: boolean;
  cloudInvestigationDescription?: string;
  userCloudClassifications?: number;
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
}) => {
  const containerClasses = isMobile
    ? "w-full bg-gray-900/80 backdrop-blur-md p-4 rounded-t-lg"
    : "flex flex-col h-full min-h-0 w-full max-w-full z-30 bg-[#10141c] border-l border-[#232b3b] p-6 text-white";

  return (
    <div className={containerClasses}>
      <div className="flex-grow space-y-6">
        <div className="text-center">
            <Satellite className="mx-auto h-12 w-12 text-blue-400" />
            <h2 className="text-xl font-bold mt-2">Satellite Controls</h2>
        </div>

        {/* Mission Selection */}
        <div>
          <label htmlFor="mission-select" className="block text-sm font-medium mb-2">Mission</label>
          <Select
            value={investigationMode}
            onValueChange={(value: 'weather' | 'planets') => setInvestigationMode(value)}
          >
            <SelectTrigger id="mission-select">
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weather">Weather Analysis</SelectItem>
              <SelectItem value="planets">Planetary Survey</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            </div>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="mt-6">
        <Button onClick={onDeploy} disabled={isDeploying} className="w-full">
          {isDeploying ? 'Deploying...' : 'Deploy Satellite'}
        </Button>
      </div>
    </div>
  );
};

export default DeploySidebar;
