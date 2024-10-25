"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import MissionPathway from "@/components/Missions/Pathway";
import ProfileCardModal from "@/components/profile/form";
import { CommunityScienceStation } from "@/components/Structures/Community/StationModal";
import { CreateCommunityStation } from "@/components/Structures/Build/MakeCommunityStation";
import StationsOnPlanet from "@/components/Structures/Community/ViewAllStations";

export default function TestPage() {
    return (
        <StarnetLayout>
            <CreateCommunityStation />
            <StationsOnPlanet />
        </StarnetLayout>
    );
};