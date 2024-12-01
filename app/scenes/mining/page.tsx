"use client";

import React from "react";
import { EarthActionSceneLayout, EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import StructureMissionGuide from "@/components/Layout/Guide";
import { MiningComponentComponent } from "@/components/mining-component";

export default function Mining() {
  return (
    <EarthActionSceneLayout>
        <MiningComponentComponent />
        <StructureMissionGuide />
    </EarthActionSceneLayout>
  ); 
};