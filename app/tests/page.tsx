"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import MissionPathway from "@/components/Missions/Pathway";
import ProfileCardModal from "@/components/profile/form";
import { CommunityScienceStation } from "@/components/Structures/Community/StationModal";
import { CreateCommunityStation } from "@/components/Structures/Build/MakeCommunityStation";

export default function TestPage() {
    return (
        <StarnetLayout>
            <CommunityScienceStation  stationName = {"Greenhouse"}
  projects = {[
    {
      id: "1",
      name: "Wildwatch Burrowing Owls",
      identifier: "zoodex-burrOwls",
      isUnlocked: false,
      level: 0,
    },
    {
      id: "2",
      name: "Iguanas from Above",
      identifier: "zoodex-iguanasFromAbove",
      isUnlocked: false,
      level: 0,
    },
  ]}
  missions = {[
    {
      id: "1",
      name: "Spot an owl in the wild",
      type: "Upload",
      completionRate: 4,
      project: "1",
      level: 2,
      isUnlocked: false,
    },
  ]}
  anomalies = {[
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ]}  />
  <CreateCommunityStation />
        </StarnetLayout>
    );
};