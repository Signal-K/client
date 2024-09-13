'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Globe, Rocket, Star, Zap } from 'lucide-react';
import { ClassificationViewerAll } from '@/app/components/(create)/(classifications)/YourClassifications';
import MineralsInventoryGrid from '@/app/components/(inventory)/mineralsPanel';
import StarterMissionsStats from '@/app/components/(scenes)/(missions)/CompletedMissions';
import { CaptnCosmosGuideModal } from '@/app/components/(dialogue)/guideBot';

interface TutorialMessageProps {
  isExpanded: boolean;
  toggleExpand: () => void;
};

export function SciFiPopupMenu() {
  const [showClassifications, setShowClassifications] = useState(false);
  const [showMiningInventory, setShowMiningInventory] = useState(false);
  const [showMissionList, setShowMissionList] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTutorialExpanded, setIsTutorialExpanded] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleTutorial = () => setIsTutorialExpanded(!isTutorialExpanded)

  const menuItems = [
    { icon: <Rocket className="w-6 h-6" />, label: 'Classifications', action: () => setShowClassifications(true), },
    { icon: <Star className="w-6 h-6" />, label: 'Inventory', action: () => setShowMiningInventory(true), },
    { icon: <Zap className="w-6 h-6" />, label: 'Missions', action: () => setShowMissionList(true), },
  ];

  return (
    <div className="fixed bottom-8 right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="absolute bottom-16 right-0 w-64 h-64"
          >
            {/* Starburst effect */}
            <div className="absolute inset-0 bg-purple-600 rounded-full animate-pulse" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgb(192, 38, 211)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgb(50, 116, 209)' }} />
                </linearGradient>
              </defs>
              <path
                fill="url(#blob-gradient)"
                d="M44.7,-76.4C58.9,-69.1,71.9,-58.2,79.7,-44.7C87.5,-31.2,90.2,-15.6,89.3,-0.5C88.4,14.6,84,29.2,76.5,42.3C69,55.4,58.4,67,45.3,75.2C32.2,83.4,16.1,88.3,0.6,87.3C-14.9,86.4,-29.8,79.6,-43.3,71.1C-56.8,62.6,-68.9,52.4,-77.7,39.5C-86.5,26.6,-91.9,13.3,-91.6,0.2C-91.3,-13,-85.2,-26,-77.1,-37.8C-69,-49.7,-58.8,-60.4,-46.1,-68.5C-33.3,-76.6,-16.7,-82.1,-0.2,-81.8C16.3,-81.5,32.6,-75.4,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ul className="space-y-4">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-white cursor-pointer"
                    onClick={item.action}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CaptnCosmosGuideModal isExpanded={isTutorialExpanded} toggleExpand={toggleTutorial} />
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-purple-600 text-white p-4 rounded-full shadow-lg focus:outline-none"
      >
        <Globe className="w-6 h-6" />
      </motion.button>

      {showClassifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full">
            <ClassificationViewerAll />
            <button
              className="mt-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
              onClick={() => setShowClassifications(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showMiningInventory && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center">
          <div className="bg-gray-50 p-6 rounded-lg max-w-lg w-full">
            <MineralsInventoryGrid />
            <button
              className="mt-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
              onClick={() => setShowMiningInventory(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showMissionList && (
        <div className="fixed inset-0 bg-red-700 bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg max-w-lg w-full">
            <StarterMissionsStats />
            <button
              className="mt-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
              onClick={() => setShowMissionList(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
};