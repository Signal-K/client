"use client";

import React from "react";
import { EarthActionSceneLayout, EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import { MiningComponentComponent } from "@/components/(scenes)/mining/mining-component";

export default function Mining() {
  return (
    <EarthActionSceneLayout>
        <MiningComponentComponent />
    </EarthActionSceneLayout>
  ); 
};