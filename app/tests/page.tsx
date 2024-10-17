"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import CompletedMissions from "@/components/Missions/CompletedMissions";
import { UnownedSurfaceStructures } from "@/components/Structures/Build/EditMode";

export default function TestPage() {
    return (
            <div className="1">
                <CompletedMissions />
            </div>
    );
};