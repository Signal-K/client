"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { 
  Telescope, 
  Satellite, 
  Cloud, 
  Car, 
  Globe, 
  Snowflake, 
  Sun,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  gradient: string;
}

const projects: Project[] = [
  {
    id: 'asteroids',
    title: 'Discover Asteroids',
    description: 'Hunt for asteroids and minor planets in telescope images',
    icon: <Telescope className="w-8 h-8" />,
    link: '/activity/deploy',
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 'exoplanets',
    title: 'Discover Exoplanets',
    description: 'Find planets orbiting distant stars using transit data',
    icon: <Globe className="w-8 h-8" />,
    link: '/activity/deploy',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 'clouds',
    title: 'Find Clouds & Storms',
    description: 'Track weather patterns and atmospheric phenomena on alien worlds',
    icon: <Cloud className="w-8 h-8" />,
    link: '/viewports/satellite/deploy',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    id: 'rovers',
    title: 'Train Rovers',
    description: 'Help rovers navigate terrain and identify mineral deposits',
    icon: <Car className="w-8 h-8" />,
    link: '/viewports/deploy/roover',
    color: 'text-green-400',
    gradient: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'planets',
    title: 'Investigate Planets',
    description: 'Study planetary properties and assess their potential for life',
    icon: <Satellite className="w-8 h-8" />,
    link: '/viewports/satellite/deploy',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'ice',
    title: 'Track Ice Formation',
    description: 'Monitor sublimation and ice behavior on terrestrial planets',
    icon: <Snowflake className="w-8 h-8" />,
    link: '/viewports/satellite/deploy',
    color: 'text-blue-300',
    gradient: 'from-blue-300/20 to-cyan-300/20'
  },
  {
    id: 'solar',
    title: 'Solar Storms & Flares',
    description: 'Observe and classify solar activity and space weather',
    icon: <Sun className="w-8 h-8" />,
    link: '/viewports/sunspots',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-orange-500/20'
  }
];

interface ProjectSelectionViewportProps {
  onProjectSelect?: (projectId: string) => void;
  classificationsCount?: number;
  showWelcomeMessage?: boolean;
}

export default function ProjectSelectionViewport({ 
  onProjectSelect, 
  classificationsCount = 0,
  showWelcomeMessage = true 
}: ProjectSelectionViewportProps) {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project.id);
  };

  const handleActivate = async () => {
    if (!selectedProject) return;
    
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    setIsTransitioning(true);
    
    // Call the callback if provided
    if (onProjectSelect) {
      onProjectSelect(selectedProject);
    }

    // Add a smooth transition effect
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0.7';
    
    // Add a small delay for the animation effect
    setTimeout(() => {
      // Reset body opacity before navigation
      document.body.style.opacity = '1';
      router.push(project.link);
    }, 800);
  };

  return (
    <div className="w-full rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden animate-in fade-in-0 duration-700 slide-in-from-top-4">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">
            {showWelcomeMessage ? 'Welcome to Star Sailors!' : 'Choose Your Next Mission'}
          </h2>
        </div>
        <p className="text-white/80 text-lg">
          {showWelcomeMessage 
            ? 'Choose your first cosmic adventure and start exploring the universe'
            : 'Select a project to deploy your tools and discover new anomalies'
          }
        </p>
        {showWelcomeMessage && (
          <div className="mt-3 px-4 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
            <p className="text-green-300 text-sm font-medium">
              🚀 Fast Deploy: Your tools will be ready in seconds instead of waiting hours!
            </p>
          </div>
        )}
      </div>

      {/* Project Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`
                cursor-pointer transition-all duration-300 hover:scale-105 border-2 relative overflow-hidden
                ${selectedProject === project.id 
                  ? 'border-white/40 bg-white/20 shadow-lg shadow-white/10' 
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-md'
                }
              `}
              onClick={() => handleProjectClick(project)}
            >
              <CardContent className="p-4 relative z-10">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${project.gradient} flex items-center justify-center mb-4 transition-transform duration-300 ${selectedProject === project.id ? 'scale-110' : ''}`}>
                  <span className={project.color}>
                    {project.icon}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {project.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-3">
                  {project.description}
                </p>
                {selectedProject === project.id && (
                  <div className="mt-3 flex items-center text-green-400 text-sm font-medium animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <span>Selected</span>
                    <ArrowRight className="w-4 h-4 ml-1 animate-pulse" />
                  </div>
                )}
              </CardContent>
              {/* Subtle background gradient overlay for selected card */}
              {selectedProject === project.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              )}
            </Card>
          ))}
        </div>

        {/* Activate Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleActivate}
            disabled={!selectedProject || isTransitioning}
            className={`
              px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300
              ${selectedProject && !isTransitioning
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }
              ${isTransitioning ? 'animate-pulse' : ''}
            `}
          >
            {isTransitioning ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Activating Tools...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {selectedProject ? 'Activate Tools for This Week' : 'Select a Project Above'}
              </div>
            )}
          </Button>
        </div>

        {selectedProject && !isTransitioning && (
          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              Your tools will be automatically deployed and ready to use in seconds!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}