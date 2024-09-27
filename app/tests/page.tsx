"use client";

import React, { useEffect, useState } from "react";
import PlanetSelector from "../components/(scenes)/planetScene/SelectPlanet";
import { BurrowingOwl } from "../components/(structures)/Zoodex/burrowingOwls";

export default function TestPage() {
    return (
        <div>
            <PlanetSelector />
            {/* <NestQuestGo anomalyId={"78344243"} /> */}
            <BurrowingOwl anomalyId="4567867" />
        </div>
    );
};