"use client";

import React, { useState } from "react";

type Tab = 'Speed' | 'Power' | 'Capacity';

const AutomatonUpgrade: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>('Speed');
  const [selectedOption, setSelectedOption] = useState<Record<Tab, number>>({
    Speed: 1,
    Power: 1,
    Capacity: 1,
  });

  const options: Record<Tab, string[]> = {
    Speed: ['Level 1', 'Level 2', 'Level 3'],
    Power: ['Level 1', 'Level 2', 'Level 3'],
    Capacity: ['Level 1', 'Level 2', 'Level 3'],
  };

  const handleTabClick = (tab: Tab) => {
    setSelectedTab(tab);
  };

  const handleOptionChange = (direction: number) => {
    setSelectedOption((prev) => {
      const newValue = prev[selectedTab] + direction;
      if (newValue > 0 && newValue <= options[selectedTab].length) {
        return { ...prev, [selectedTab]: newValue };
      }
      return prev;
    });
  };

  const handleSave = () => {
    console.log('Configuration Saved:', selectedOption);
  };

  return (
    <div className="bg-cyan-50 text-red-700 p-6 flex flex-col">
      <div className="flex justify-around w-full mb-8">
        {Object.keys(options).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab as Tab)}
            className={`px-4 py-2 rounded-lg ${selectedTab === tab ? 'bg-white text-black' : 'bg-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center mb-6">
        <button
          onClick={() => handleOptionChange(-1)}
          className="px-2 py-1 bg-gray-700 rounded-l-lg"
        >
          ←
        </button>
        <div className="mx-4 text-center">
          <img
            src={`/Assets/Images/${selectedTab.toLowerCase()}-${selectedOption[selectedTab]}.png`}
            alt={`${selectedTab} option`}
            className="w-64 h-64 object-cover mb-2"
          />
          <h2 className="text-2xl">{`${selectedTab} ${options[selectedTab][selectedOption[selectedTab] - 1]}`}</h2>
        </div>
        <button
          onClick={() => handleOptionChange(1)}
          className="px-2 py-1 bg-gray-700 rounded-r-lg"
        >
          →
        </button>
      </div>
      
      <button
        onClick={handleSave}
        className="mt-auto bg-green-500 text-black py-3 px-10 rounded-lg"
      >
        Save Configuration
      </button>
    </div>
  );
};

export default AutomatonUpgrade;