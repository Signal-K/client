"use client";

import React, { useState } from "react";
import { MineralDeposit } from "@/types/Items";
import { ActiveAutomatonForMining } from "@/app/components/(vehicles)/(automatons)/ActiveAutomaton";

interface CollectMineralPanelProps {
  deposit: MineralDeposit;
  iconUrl: string;
};

export const SelectMineralPanel: React.FC<CollectMineralPanelProps> = ({ deposit, iconUrl }) => {
  const [showAutomatonPanel, setShowAutomatonPanel] = useState(false);

  const handleNextStep = () => {
    setShowAutomatonPanel(true);
  }; 

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white bg-opacity-90">
      <h2 className="text-xl font-semibold mb-4">Mineral Details</h2>
      <div className="mb-4 flex items-center">
        <img
          src={iconUrl}
          alt={deposit.mineralconfiguration.mineral}
          className="w-16 h-16 mr-4"
        />
        <div>
          <h3 className="text-lg font-bold">Collect {deposit.mineralconfiguration.mineral} from this deposit</h3>
          <p className="text-sm">{deposit.mineralconfiguration.quantity} "{deposit.mineralconfiguration.mineral}" remaining</p>
          <p className="text-sm text-gray-600">
            Cargo Space: 1
          </p>
        </div>
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleNextStep}
      >
        Next step
      </button>

      {showAutomatonPanel && (
        <div className="mt-4">
          <ActiveAutomatonForMining deposit={deposit} />
        </div>
      )}
    </div>
  );
};