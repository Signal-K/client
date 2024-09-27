"use client";

import React, { useEffect, useState } from "react";
import PlanetSelector from "../components/(scenes)/planetScene/SelectPlanet";
import { CloudspottingOnMars } from "../components/(structures)/Lidar/cloudspottingOnMars";

export default function TestPage() {
    return (
        <div>
            <PlanetSelector />
            <CloudspottingOnMars anomalyId={"84238508"} />
        </div>
    );
};