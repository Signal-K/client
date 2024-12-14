"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";
import ProfileCardModal from "@/components/profile/form";

export default function TestPage() {
    return (
        <StarnetLayout>
            {/* <StationsOnPlanet /> */}
            <ProfileCardModal />
        </StarnetLayout>
    );
};