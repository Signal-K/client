"use client";

import React, { useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MineralDeposits from "@/components/(structures)/Mining/Archive/AvailableDeposits";
import { SelectMineralPanel } from "@/components/(structures)/Mining/Archive/MiningPanels";
import MineralsInventoryGrid from "@/components/(inventory)/mineralsPanel";

enum Step {
  MineralDeposits = "MINERAL_DEPOSITS",
  MineralDetails = "MINERAL_DETAILS",
};

export default function MiningScene() {
  const { activePlanet } = useActivePlanet();
  const [currentStep, setCurrentStep] = useState<Step>(Step.MineralDeposits);
  const [selectedDeposit, setSelectedDeposit] = useState<null | any>(null);

  const handleSelectDeposit = (deposit: any) => {
    setSelectedDeposit(deposit);
    setCurrentStep(Step.MineralDetails);
  };

  const handleBack = () => {
    setCurrentStep(Step.MineralDeposits);
    setSelectedDeposit(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {currentStep === Step.MineralDeposits && (
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-4 px-12 rounded-r-lg shadow-lg md:rounded-r-lg border-r border-red-300">
            <MineralDeposits onSelectDeposit={handleSelectDeposit} />
          </div>
        </div>
      )}

      {currentStep === Step.MineralDetails && selectedDeposit && (
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 md p-4 px-12 rounded-r-lg shadow-lg md:rounded-r-lg border-r border-red-300">
            <button
              className="mb-4 bg-[#2C3A4A] text-white px-4 py-2 rounded"
              onClick={handleBack}
            >
              Back
            </button>
            <SelectMineralPanel deposit={selectedDeposit} />
          </div>
        </div>
      )}
    </div>
  );
};