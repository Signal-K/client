"use client";

import React, { useEffect, useState, useCallback } from "react";
import LaunchpadStructure from "../../components/(structures)/Launchpad/Dashboard";
import MissionList from "../../components/(scenes)/planetScene/availableMissions";
import { PlanetSwitcher } from "../../components/(scenes)/planetScene/SwitchPlanet";

export default function TestPage() {
    return (
        <div>
            {/* <LaunchpadStructure /> */}
            <PlanetSwitcher />
        </div>
    );
};


