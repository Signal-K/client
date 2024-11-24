"use client";

import React, { useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MineralsInventoryGrid from "@/components/Inventory/mineralsPanel";
import StarnetLayout from "@/components/Layout/Starnet";
import { EarthActionSceneLayout, EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import StructureMissionGuide from "@/components/Layout/Guide";
import { MiningComponentComponent } from "@/components/mining-component";

enum Step {
  MineralDeposits = "MINERAL_DEPOSITS",
  MineralDetails = "MINERAL_DETAILS",
};

export default function Mining() {
  return (
    <EarthActionSceneLayout>
        <MiningComponentComponent />
        <StructureMissionGuide />
    </EarthActionSceneLayout>
  ); 
};