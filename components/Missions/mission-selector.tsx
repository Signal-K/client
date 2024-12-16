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
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, updatePlanetLocation } = useActivePlanet();

  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [selectedProject, setSelectedProject] = useState<Mission | null>(null);
  const [stage, setStage] = useState<'structure' | 'project' | 'confirm'>('structure');

  const handleStructureSelect = ( structure: Structure ) => {
    setSelectedStructure(structure);
    setStage('project');
  };

  const handleProjectSelect = ( project: Mission ) => {
    setSelectedProject(project);
    setStage('confirm');
  };

  const handleBack = () => {
    if (stage === 'project') {
      setSelectedStructure(null);
      setStage('structure');
    } else if (stage === 'confirm') {
      setSelectedProject(null);
      setStage('project');
    };
  };

  const handleConfirm = async () => {
    console.log('Starting project: ', selectedProject?.name);

    if (!session || !selectedProject) return;

    const initialiseUserMissionData = {
      user: session.user.id,
      time_of_completion: new Date().toISOString(),
      mission: 10000001,
    };

    const chooseFirstClassificationMissionData = {
      user: session.user.id,
      time_of_completion: new Date().toISOString(),
      mission: 10000002,
    };

    const structureCreationData = {
      owner: session.user.id,
      item: selectedProject.activeStructure,
      anomaly: activePlanet?.id || 30,
      quantity: 1,
      notes: "Created for user's first classification mission",
      configuration: {
        "Uses": 10,
        "missions unlocked": [selectedProject.identifier],
      },
    };

    const researchedStructureData = {
      user_id: session?.user.id,
      tech_type: selectedProject.activeStructure,
      tech_id: selectedProject.techId,
      created_at: new Date().toISOString(),
    };

    try {
      updatePlanetLocation(30);
      const { error: missionError1 } = await supabase
        .from('missions')
        .insert([initialiseUserMissionData]);
      
      const { error: missionError2 } = await supabase
        .from('missions')
        .insert([chooseFirstClassificationMissionData]);

      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert([structureCreationData]);

      const { error: researchedError } = await supabase
        .from("researched")
        .insert([researchedStructureData]);

      setConfirmationMessage("Mission confirmed and added successfully!");
    } catch (error: any) {
      setConfirmationMessage(`Error: ${error.message}`);
    };
  };

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const introSteps = [
    "Welcome, future scientist!",
    "Your journey into the world of scientific discovery begins now.",
    "Choose your field of study and embark on an exciting mission!",
  ];

  const categories = combineCategories();

  useEffect(() => {
    if (step < introSteps.length) {
      const timer = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleConfirmMission = async () => {
    if (!session || !selectedMission) return;

    const initialiseUserMissionData = {
      user: session.user.id,
      time_of_completion: new Date().toISOString(),
      mission: 10000001,
    };

    const chooseFirstClassificationMissionData = {
      user: session.user.id,
      time_of_completion: new Date().toISOString(),
      mission: 10000002,
    };

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

    const researchedStructureData = {
      user_id: session?.user.id,
      tech_type: selectedMission.activeStructure,
      tech_id: selectedMission.techId,
      created_at: new Date().toISOString(),
    };

    try {
      updatePlanetLocation(30);
      const { error: missionError1 } = await supabase
          .from('missions')
          .insert([initialiseUserMissionData]);

      if (missionError1) {
          throw missionError1;
      };

      const { error: missionError2 } = await supabase
          .from('missions')
          .insert([chooseFirstClassificationMissionData]);

      if (missionError2) {
          throw missionError2;
      };

      const { error: inventoryError } = await supabase
          .from("inventory")
          .insert([structureCreationData]);

      if (inventoryError) {
          throw inventoryError;
      };

      const { error: researchedError } = await supabase
          .from("researched")
          .insert([researchedStructureData]);

      setConfirmationMessage("Mission confirmed and added successfully!");
  } catch (error: any) {
      setConfirmationMessage(`Error: ${error.message}`);
  };

    if (selectedMission) {
      setConfirmationMessage(`Congratulations! You've embarked on the "${selectedMission.name}" mission. Your scientific adventure begins now!`);
    };
  };

  const MissionIcon = ({ icon, isSelected }: { icon: string; isSelected: boolean }) => (
    <motion.div
      className="text-4xl"
      animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatType: "reverse" }}
    >
      {icon}
    </motion.div>
  );

  return (
    <div className='p-6 max-w-4xl mx-auto font-mono'>
      <Card className='overflow-hidden relative bg-gradient-to-br from-gray-900  via-gray-800 to-gray-900 border-2 border-gray-700'>
        <CardContent className='p-6 min-h-[600px]'>
          <div className='flex flex-col h-full text-gray-300'>
            <div className='mb-6'>
              <h1 className='text-3xl font-bold text-center mb-2 text-gray-100 tracking-wider'>
                Welcome to Star Sailors!
              </h1>
              <div className='text-center text-gray-400'>
                {stage === 'structure' && "Select a structure that interests you to begin adding and classifying data for various projects."}
                {stage === 'project' && "Choose a project that this structure offers"}
                {stage === 'confirm' && "Confirm this project to be given this structure and begin classifying the data it provides"}
              </div>
            </div>

            <div className='flex-grow'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={stage}
                  initial = {{ opacity: 0 }}
                  animate = {{ opacity: 1 }}
                  exit = {{ opacity: 0 }}
                  transition = {{ duration: 0.3 }}
                  className='h-full flex flex-col'
                >
                  <div className='grid grid-cols-1 gap-4 h-full'>
                    {stage === 'structure' && structures.map((structure) => (
                      <Card
                        key={structure.name}
                        className={`cursor-pointer hover:shadow-lg transition-all duration-300 flex ${structure.bgColor} border border-gray-600 relative overflow-hidden`}
                        onClick={() => handleStructureSelect(structure)}
                      >
                        <CardContent className='p-4 flex items-center z-10'>
                          <structure.icon className={`w-12 h-12 mr-4 ${structure.accentColor}`} />
                          <div>
                            <h2 className={`text-xl font-semibold mb-2 ${structure.accentColor}`}>{structure.name}</h2>
                            <p className="text-sm text-gray-300">{structure.description}</p>
                          </div>
                        </CardContent>
                        {structure.shape}
                      </Card>
                    ))}
                    {stage === 'project' && selectedStructure?.name && projects[selectedStructure.name]?.map((project) => (
                      <Card
                        key={project.identifier}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <CardContent>
                          <h3>{project.name}</h3>
                          <p>{project.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {stage === 'confirm' && (
                      <Card className={`${selectedStructure?.bgColor} border border-gray-600 relative overflow-hidden`}>
                        <CardContent className="p-4 z-10">
                          <h2 className={`text-2xl font-semibold mb-4 ${selectedStructure?.accentColor}`}>Confirm Your Mission</h2>
                          <div className="space-y-2 text-gray-300">
                            <p><strong>Facility:</strong> {selectedStructure?.name}</p>
                            <p><strong>Project:</strong> {selectedProject?.name}</p>
                            <p><strong>Objective:</strong> {selectedProject?.description}</p>
                            <p><strong>Mission ID:</strong> {selectedProject?.identifier}</p>
                            <p><strong>Databank:</strong> <a href={selectedProject?.sourceLink} target="_blank" rel="noopener noreferrer" className={`${selectedStructure?.accentColor} hover:underline`}>Access Files</a></p>
                          </div>
                        </CardContent>
                        {selectedStructure?.shape}
                      </Card>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className='mt-6 flex justify-between items-center'>
              {selectedStructure && stage !== 'confirm' && (
                <div className="flex items-center">
                  <selectedStructure.icon className={`w-12 h-12 mr-2 ${selectedStructure.accentColor}`} />
                  <span className={`${selectedStructure.accentColor} font-semibold`}>{selectedStructure.name}</span>
                </div>
              )}
              <div className="space-x-4 ml-auto">
                {stage !== 'structure' && (
                  <Button onClick={handleBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Back
                  </Button>
                )}
                {stage === 'confirm' && (
                  <Button onClick={handleConfirm} className={`${selectedStructure?.bgColor} ${selectedStructure?.accentColor} hover:bg-opacity-80`}>
                    Launch Mission
                  </Button>
                )}
            </div>
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwMDAiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzMzMzMzMzEwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-20"></div>
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};