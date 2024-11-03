'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, CloudSun, Rocket, Leaf, LucideIcon } from 'lucide-react'
import { zoodexDataSources, telescopeDataSources, lidarDataSources } from "@/components/Data/ZoodexDataSources";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface Mission {
  name: string;
  icon: string;
  description: string;
  identifier: string;
  techId: number;
  tutorialMission: number;
  activeStructure: number;
}

interface Category {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  details: Mission[];
}

// Function to generate categories dynamically from zoodexDataSources
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

  // if (!activePlanet || activePlanet.id ! == 30) {
  //   updatePlanetLocation(30);
  // };

  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const introSteps = [
    "Welcome, future scientist!",
    "Your journey into the world of scientific discovery begins now.",
    "Choose your field of study and embark on an exciting mission!",
  ];

  const categories = combineCategories(); // Use dynamically generated categories

  useEffect(() => {
    if (step < introSteps.length) {
      const timer = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleBack = () => {
    if (selectedMission) {
      setSelectedMission(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < introSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedMission(null);
  };

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
      anomaly: activePlanet.id || 30,
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
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        body {
          font-family: 'Press Start 2P', cursive;
        }
      `}</style>
      <div className="max-w-4xl w-full bg-green-100 bg-opacity-80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border-4 border-green-300">
        <div className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {step < introSteps.length ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.5 }}
                className="text-xl font-light text-center h-20 flex items-center justify-center"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                <span className="text-green-800">
                  {introSteps[step]}
                </span>
              </motion.div>
            ) : selectedCategory ? (
              selectedMission ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                  style={{ maxWidth: "100%", wordBreak: "break-word" }}
                >
                  <h2 className="text-2xl font-semibold text-center text-green-800">
                    {selectedMission.name}
                  </h2>
                  <p className="text-green-700 text-center text-sm">{selectedMission.description}</p>
                  <p className="text-green-700 text-center text-xs">Identifier: {selectedMission.identifier}</p>
                  <p className="text-green-700 text-center text-xs">Tutorial Mission: {selectedMission.tutorialMission}</p>
                  <p className="text-green-700 text-center text-xs">Active Structure: {selectedMission.activeStructure}</p>
                  <div className="flex justify-center">
                    <MissionIcon icon={selectedMission.icon} isSelected={true} />
                  </div>
                  <button
                    onClick={handleConfirmMission}
                    className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300 text-sm"
                  >
                    Confirm Mission
                  </button>
                  {confirmationMessage && (
                    <p className="text-center text-green-800 text-sm">{confirmationMessage}</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                  style={{ maxWidth: "100%", wordBreak: "break-word" }}
                >
                  <h2 className="text-2xl font-semibold text-center text-green-800">
                    {selectedCategory.title}
                  </h2>
                  <p className="text-green-700 text-center text-sm">{selectedCategory.description}</p>
                  <ul className="space-y-4">
                    {selectedCategory.details.map((mission, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleMissionSelect(mission)}
                        className="p-4 bg-green-200 hover:bg-green-300 rounded-lg cursor-pointer transition-colors duration-300 flex items-center space-x-4"
                      >
                        <MissionIcon icon={mission.icon} isSelected={false} />
                        <span className="text-green-800 text-sm">{mission.name}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleBackToCategories}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300 text-sm"
                  >
                    Back to Categories
                  </button>
                </motion.div>
              )
            ) : (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold text-center text-green-800">Select Your Scientific Path</h2>
                <ul className="space-y-4">
                  {categories.map(category => (
                    <li
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="p-4 bg-green-200 hover:bg-green-300 rounded-lg cursor-pointer transition-colors duration-300 flex items-center space-x-4"
                    >
                      <category.icon className="text-green-800" />
                      <span className="text-green-800 text-sm">{category.title}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {step < introSteps.length ? (
          <div className="flex justify-end p-4">
            <button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
            >
              <ChevronRight />
            </button>
          </div>
        ) : (
          <div className="flex justify-between p-4">
            <button
              onClick={handleBack}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
            >
              <ChevronLeft />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};