"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PlanetSwitcher } from "../components/(scenes)/planetScene/SwitchPlanet";

export default function TestPage() {
    return (
        <div>
            <PlanetSwitcher />
        </div>
    );
};