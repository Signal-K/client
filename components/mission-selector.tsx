'use client';

import { useState, useEffect, SetStateAction, Key } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CloudSun, Rocket, Leaf } from 'lucide-react';

// Define types for the category and mission objects
type Mission = {
  name: string;
  icon: string; // Assuming the icons are emoji strings or similar
};

type Category = {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>; // Adjust if you have a specific icon type
  details: Mission[];
};

// Categories data
const categories: Category[] = [
  {
    id: 1,
    title: 'Meteorology/Geology',
    description: 'Study weather patterns and geological phenomena',
    icon: CloudSun,
    details: [
      { name: 'Track storms on gas giants', icon: '🌪️' },
      { name: 'Analyze seismic activity on Mars', icon: '🌋' },
      { name: 'Study cloud formations on Venus', icon: '☁️' }
    ]
  },
  {
    id: 2,
    title: 'Astronomy',
    description: 'Explore the cosmos and celestial bodies',
    icon: Rocket,
    details: [
      { name: 'Analyze telescope imagery', icon: '🔭' },
      { name: 'Search for exoplanets', icon: '🪐' },
      { name: 'Study black hole behavior', icon: '🕳️' }
    ]
  },
  {
    id: 3,
    title: 'Biology',
    description: 'Investigate life forms and ecosystems',
    icon: Leaf,
    details: [
      { name: 'Catalog deep-sea creatures', icon: '🐙' },
      { name: 'Study microbial life in extreme environments', icon: '🦠' },
      { name: 'Analyze plant growth in microgravity', icon: '🌱' }
    ]
  }
];

export function MissionSelectorComponent() {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const introSteps = [
    "Welcome, future scientist!",
    "Your journey into the world of scientific discovery begins now.",
    "Choose your field of study and embark on an exciting mission!"
  ];

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

  const handleConfirmMission = () => {
    if (selectedMission) {
      setConfirmationMessage(`Congratulations! You've embarked on the "${selectedMission.name}" mission. Your scientific adventure begins now!`);
    }
  };

  const MissionIcon = ({ icon, isSelected }: { icon: string; isSelected: boolean }) => (
    <motion.div
      className="text-4xl"
      animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
      transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatType: 'reverse' }}
    >
      {icon}
    </motion.div>
  );

  return ( // bg-[url('/placeholder.svg?height=1080&width=1920')]
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
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                <span className="text-green-800">{introSteps[step]}</span>
              </motion.div>
            ) : selectedCategory ? (
              selectedMission ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                  style={{ maxWidth: '100%', wordBreak: 'break-word' }}
                >
                  <h2 className="text-2xl font-semibold text-center text-green-800">
                    {selectedMission.name}
                  </h2>
                  <p className="text-green-700 text-center text-sm">
                    Part of ({selectedCategory.description})
                  </p>
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
                  style={{ maxWidth: '100%', wordBreak: 'break-word' }}
                >
                  <h2 className="text-2xl font-semibold text-center text-green-800">
                    {selectedCategory.title}
                  </h2>
                  <p className="text-green-700 text-center text-sm">
                    {selectedCategory.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCategory.details.map((mission) => (
                      <button
                        key={mission.name}
                        onClick={() => handleMissionSelect(mission)}
                        className="w-full bg-green-200 hover:bg-green-300 text-green-800 font-medium py-2 px-4 rounded transition-colors duration-300 text-sm"
                      >
                        {mission.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleBackToCategories}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300 text-sm"
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
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h2 className="text-2xl font-semibold text-green-800">Select a Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full bg-green-200 hover:bg-green-300 text-green-800 font-medium py-2 px-4 rounded transition-colors duration-300 text-sm"
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {step >= introSteps.length && !selectedCategory && (
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-green-800 hover:text-green-600"
              >
                <ChevronLeft />
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 text-green-800 hover:text-green-600"
              >
                <span>Next</span>
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}