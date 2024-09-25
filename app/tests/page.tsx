"use client";

import React, { useEffect, useState } from "react";
import PlanetSelector from "../components/(scenes)/planetScene/SelectPlanet";
import { cloudClassificationConfig, planetClassificationConfig, roverImgClassificationConfig } from "../components/(create)/(classifications)/FormConfigurations";

export default function TestPage() {
    return (
        <div>
            <PlanetSelector />
        </div>
    );
};