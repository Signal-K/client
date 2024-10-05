"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';

type Tab = 'Speed' | 'Power' | 'Capacity';

interface AutomatonUpgradeProps {
  onSave: () => void;
  inventoryId: number;
};

const AutomatonUpgrade: React.FC<AutomatonUpgradeProps> = ({ onSave, inventoryId }) => {
  const supabase = createClientComponentClient();
  const session = useSession();

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

  useEffect(() => {
    const fetchConfiguration = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('configuration')
        .eq('id', inventoryId)
        .single();

      if (error) {
        console.error('Error fetching configuration:', error.message);
        return;
      }

      if (data?.configuration) {
        setSelectedOption({
          Speed: data.configuration.Speed || 1,
          Power: data.configuration.Power || 1,
          Capacity: data.configuration.Capacity || 1,
        });
      }
    };

    fetchConfiguration();
  }, [inventoryId, supabase]);

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

  const handleSave = async () => {
    const newConfiguration = {
      Speed: selectedOption.Speed,
      Power: selectedOption.Power,
      Capacity: selectedOption.Capacity,
    };

    const { error } = await supabase
      .from('inventory')
      .update({ configuration: newConfiguration })
      .eq('id', inventoryId);

    if (error) {
      console.error('Error updating configuration:', error.message);
    } else {
      console.log('Saved configuration:', newConfiguration);
      onSave();
    }
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

      <div className="mt-4">
        <button
          className={`block bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500}`}
          onClick={handleSave}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default AutomatonUpgrade;