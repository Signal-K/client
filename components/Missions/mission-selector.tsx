'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, CloudSun, Rocket, Leaf, LucideIcon } from 'lucide-react'
import { zoodexDataSources, telescopeDataSources, lidarDataSources } from "@/components/Data/ZoodexDataSources";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface Mission {
  name: string;
  icon: string;
  description: string;
  identifier: string;
  techId: number;
  tutorialMission: number;
  activeStructure: number;
  sourceLink?: string;
};

interface Category {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  details: Mission[];
};

interface Structure {
  name: string;
  icon: React.ElementType;
  description: string;
  bgColor: string;
  accentColor: string;
  inventoryItemId: number;
  shape: React.ReactNode;
};

interface Project {
  name: string;
  description: string;
  identifier: string;
  sourceLink: string;
  icon: string;           
  techId: number;         
  tutorialMission: number;
  activeStructure: number;
};

const structures: Structure[] = [
  {
    name: 'Refracting Telescope',
    icon: Rocket,
    description: 'Browse & classify space-based observations & classifications', 
    bgColor: 'bg-indigo-900',
    accentColor: 'text-purple-400',
    shape: <div className="absolute top-0 right-0 w-32 h-32 bg-purple-800 rounded-full -mr-16 -mt-16 opacity-20"></div>,
    inventoryItemId: 3103,
  },
  {
    name: 'Biodome',
    icon: Leaf,
    description: 'For xenobiologists studying alien life forms',
    bgColor: 'bg-green-700',
    accentColor: 'text-green-300',
    shape: <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-600 rounded-tr-full -ml-20 -mb-20 opacity-20"></div>,
    inventoryItemId: 3104,
  },
  {
    name: 'Atmospheric Probe', 
    icon: CloudSun,
    description: 'For climatologists analyzing extraterrestrial atmospheres',
    bgColor: 'bg-blue-600',
    accentColor: 'text-blue-200',
    shape: <div className="absolute top-0 left-0 w-48 h-24 bg-blue-500 rounded-br-full -ml-24 -mt-12 opacity-20"></div>,
    inventoryItemId: 3105,
  },
];

const projects: Record<string, Project[]> = {
  'Refracting Telescope': [
    {
      name: 'Planet Hunting', description: 'Discover real planets in our galactic community', identifier: 'telescope-tess', sourceLink: 'https://www.zooniverse.org/projects/mschwamb/planet-hunters-ngts',
      icon: '',
      techId: 3103,
      tutorialMission: 3000001,
      activeStructure: 3103,
    },
    {
      name: 'Asteroid Detection', description: "Discover new asteroids everyday in your telescope's data", identifier: 'telescope-minorPlanet', sourceLink: 'https://www.zooniverse.org/projects/fulsdavid/the-daily-minor-planet',
      icon: '',
      techId: 3103,
      tutorialMission: 20000004,
      activeStructure: 3103,
    },
    {
      name: 'Sunspot observations', description: "Help diagnose our sun's health problems and behaviour", identifier: 'telescope-sunspots', sourceLink: 'https://www.zooniverse.org/projects/teolixx/sunspot-detectives',
      icon: '',
      techId: 3103,
      tutorialMission: 3000002,
      activeStructure: 3103,
    }
  ],
  'Biodome': [
    {
      name: 'Wildwatch Burrowing Owls', description: 'Document and understand the developmental milestones of Otey Mesa burrowing owls through your observation satellites', identifier: 'zoodex-burrowingOwl', sourceLink: 'zooniverse.org/projects/sandiegozooglobal/wildwatch-burrowing-owl/',
      icon: '',
      techId: 3104,
      tutorialMission: 3000004,
      activeStructure: 3104,
    },
    {
      name: 'Iguanas from Above', description: 'Help us count Galapagos Marine Iguanas from aerial photographs taken by your satellite network', identifier: 'zoodex-iguanasFromAbove', sourceLink: 'https://www.zooniverse.org/projects/andreavarela89/iguanas-from-above',
      icon: '',
      techId: 3104,
      tutorialMission: 3000004,
      activeStructure: 3104,
    },
  ],
  'Atmospheric Probe': [
    {
      name: 'Martian Cloud Survey', description: 'Model cloud behaviour on Mars (and similar exoplanet candidates)', identifier: 'lidar-martianClouds', sourceLink: 'https://www.zooniverse.org/projects/marek-slipski/cloudspotting-on-mars',
      icon: '',
      techId: 3105,
      tutorialMission: 3000010,
      activeStructure: 3105,
    },
    {
      name: 'Vortex Hunter', description: 'Identify and manipulate features & fluid dynamics in gaseous planets like Jupiter', identifier: 'lidar-jovianVortexHunter', sourceLink: 'zooniverse.org/projects/ramanakumars/jovian-vortex-hunter/',
      icon: '',
      techId: 3105,
      tutorialMission: 20000007,
      activeStructure: 3105,
    },
  ],
};

const combineCategories = (): Category[] => {
  return [
    {
      id: 1,
      title: "Biological Projects",
      description: "Explore biological research projects related to animals and biodiversity.",
      icon: Leaf,
      details: zoodexDataSources.flatMap(source =>
        source.items.map(item => ({
          name: item.name,
          techId: item.techId,
          icon: '🐾', 
          description: item.description,
          identifier: item.identifier,
          tutorialMission: item.tutorialMission,
          activeStructure: item.activeStructure
        }))
      ),
    },
    {
      id: 2,
      title: "Space Investigations",
      description: "Dive into astronomical research focused on planets, stars, and cosmic phenomena.",
      icon: Rocket,
      details: telescopeDataSources.flatMap(source =>
        source.items.filter(item => item.techId === 1).map(item => ({
          name: item.name,
          icon: '🚀', // Example icon
          description: item.description,
          techId: item.techId,
          identifier: item.identifier,
          tutorialMission: item.tutorialMission,
          activeStructure: item.activeStructure
        }))
      ),
    },
    {
      id: 3,
      title: "Meteorological Studies",
      description: "Study weather patterns and cloud formations on various planets.",
      icon: CloudSun,
      details: lidarDataSources.flatMap(source =>
        source.items.filter(item => item.techId === 5).map(item => ({
          name: item.name,
          techId: item.techId,
          icon: '🌦️',
          description: item.description,
          identifier: item.identifier,
          tutorialMission: item.tutorialMission,
          activeStructure: item.activeStructure
        }))
      ), 
    },
  ];
};

export default function MissionSelector() {
  const { activePlanet, updatePlanetLocation } = useActivePlanet();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const handleStructureClick = (structure: Structure) => {
    setSelectedStructure(structure);
    setSelectedMission(null);
    setConfirmationMessage('');
  };

  const handleMissionClick = (mission: Mission) => {
    setSelectedMission(mission);
    setConfirmationMessage('');
  };

  const handleConfirmMission = async () => {
    if (!session || !selectedMission) return;

    const structureCreationData = {
      owner: session.user.id,
      item: selectedMission.activeStructure,
      anomaly: activePlanet?.id || 30,
      quantity: 1,
      notes: "Created for user's first classification mission",
      configuration: {
        "Uses": 10,
        "missions unlocked": [selectedMission.identifier],
      },
    };

    try {
      updatePlanetLocation(30);
      await supabase.from("inventory").insert([structureCreationData]);

      setConfirmationMessage(`Mission "${selectedMission.name}" confirmed!`);
    } catch (error: any) {
      setConfirmationMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {structures.map((structure) => (
          <Card key={structure.name} onClick={() => handleStructureClick(structure)} className={`cursor-pointer relative ${structure.bgColor}`}>
            <CardContent className="p-4 text-white">
              {structure.shape}
              <structure.icon className={`w-8 h-8 ${structure.accentColor}`} />
              <h3 className="text-lg font-semibold mt-2">{structure.name}</h3>
              <p className="text-sm opacity-80">{structure.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStructure && (
        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Missions for {selectedStructure.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projects[selectedStructure.name]?.map((mission) => (
              <Card key={mission.identifier} onClick={() => handleMissionClick(mission)} className="cursor-pointer">
                <CardContent className="p-4">
                  <h4 className="text-md font-medium">{mission.name}</h4>
                  <p className="text-sm">{mission.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedMission && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Confirm Mission</h3>
          <p className="mb-2">{selectedMission.name}: {selectedMission.description}</p>
          <Button onClick={handleConfirmMission}>Confirm & Begin</Button>
        </div>
      )}

      {confirmationMessage && (
        <div className="text-green-500 mt-4 font-medium">{confirmationMessage}</div>
      )}
    </div>
  );
};