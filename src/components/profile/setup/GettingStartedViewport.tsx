"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import Section from "@/src/components/sections/Section";
import { Telescope, Satellite, Car } from "lucide-react";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

interface ClassificationProgress {
  totalClassifications: number;
  classificationTypes: string[];
  toolsUsed: {
    telescope: number;
    satellite: number;
    rover: number;
  };
}

interface GettingStartedViewportProps {
  classificationsCount: number;
  classificationTypes?: string[];
}

export default function GettingStartedViewport({ 
  classificationsCount,
  classificationTypes = []
}: GettingStartedViewportProps) {
  const router = useRouter();
  const { isDark } = UseDarkMode();
  
  const [progress, setProgress] = useState<ClassificationProgress>({
    totalClassifications: classificationsCount,
    classificationTypes: classificationTypes,
    toolsUsed: {
      telescope: 0,
      satellite: 0,
      rover: 0
    }
  });

  // Only show for users with less than 4 classifications AND less than 2 classification types
  const shouldShow = progress.totalClassifications < 4 && progress.classificationTypes.length < 2;

  useEffect(() => {
    if (!shouldShow) return;

    const fetchProgressData = async () => {
      try {
        const response = await fetch("/api/gameplay/profile/getting-started", {
          method: "GET",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch progress data");
        }

        setProgress(payload);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      }
    };

    fetchProgressData();
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const tools = [
    {
      name: 'Telescope',
      icon: <Telescope className="w-6 h-6" />,
      count: progress.toolsUsed.telescope,
      description: 'Discover exoplanets, track asteroids, and monitor solar activity',
      link: '/structures/telescope',
      color: 'text-blue-400'
    },
    {
      name: 'Satellite',
      icon: <Satellite className="w-6 h-6" />,
      count: progress.toolsUsed.satellite,
      description: 'Study planetary atmospheres and weather patterns',
      link: '/viewports/satellite',
      color: 'text-purple-400'
    },
    {
      name: 'Rover',
      icon: <Car className="w-6 h-6" />,
      count: progress.toolsUsed.rover,
      description: 'Analyze surface features and terrain on distant worlds',
      link: '/viewports/roover',
      color: 'text-orange-400'
    }
  ];

  return (
    <Section
      variant="minimal"
      backgroundType="none"
      sectionId="getting-started-progress"
      infoText="Track your citizen science journey and discover new tools to advance your research skills"
      className="relative"
    >
      {/* Custom minimal space background */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: isDark 
            ? `
              radial-gradient(ellipse at 20% 30%, #1a1a2e 0%, transparent 60%),
              radial-gradient(ellipse at 80% 70%, #16213e 0%, transparent 70%),
              linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)
            `
            : `
              radial-gradient(ellipse at 20% 30%, #2d3748 0%, transparent 60%),
              radial-gradient(ellipse at 80% 70%, #4a5568 0%, transparent 70%),
              linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)
            `
        }}
      >
        {/* Minimal stars */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${isDark ? 'bg-white opacity-60' : 'bg-white opacity-80'}`}
            style={{
              left: `${15 + (i * 7.5) % 70}%`,
              top: `${20 + (i * 6.2) % 60}%`,
              width: i % 3 === 0 ? '2px' : '1px',
              height: i % 3 === 0 ? '2px' : '1px',
              boxShadow: i % 3 === 0 ? '0 0 4px #ffffff' : '0 0 2px #ffffff',
              animation: `twinkle ${3 + (i % 3)}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-100'}`}>Your Progress</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-200'}`}>
              Deploy virtual structures to collect real astronomical data, then classify your discoveries to contribute to ongoing research. 
              Each classification helps scientists understand our universe better.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#78cce2]">{progress.totalClassifications}</div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Classifications Made</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`border rounded-lg p-4 backdrop-blur-sm hover:bg-black/40 transition-colors ${
                isDark 
                  ? 'bg-black/30 border-[#3B4252]' 
                  : 'bg-black/50 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${tool.color}`}>
                  {tool.icon}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-100'}`}>{tool.name}</h3>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>
                    {tool.count > 0 ? `${tool.count} project${tool.count !== 1 ? 's' : ''} completed` : 'Not started'}
                  </div>
                </div>
              </div>
              <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-200'}`}>{tool.description}</p>
              <Button
                onClick={() => router.push(tool.link)}
                variant={tool.count > 0 ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {tool.count > 0 ? 'Continue Research' : 'Start Here'}
              </Button>
            </div>
          ))}
        </div>

        <div className={`flex items-center justify-between rounded-lg p-4 ${
          isDark 
            ? 'bg-black/20 border border-[#78cce2]/30' 
            : 'bg-black/40 border border-[#78cce2]/50'
        }`}>
          <div>
            <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-100'}`}>Next Milestone</h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-200'}`}>
              Complete {4 - progress.totalClassifications} more classification{4 - progress.totalClassifications !== 1 ? 's' : ''} 
              {progress.classificationTypes.length < 2 && ` and try ${2 - progress.classificationTypes.length} different project type${2 - progress.classificationTypes.length !== 1 ? 's' : ''}`}
              to unlock advanced features
            </p>
          </div>
          <div className="flex gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-[#78cce2]">{progress.totalClassifications}/4</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Classifications</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#78cce2]">{progress.classificationTypes.length}/2</div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-300'}`}>Project Types</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </Section>
  );
}
