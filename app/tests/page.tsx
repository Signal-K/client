"use client";

import React, { useEffect, useState } from "react";
import StarnetLayout from "@/components/Layout/Starnet";
import { ExoplanetTransitHunter } from "@/components/Projects/Telescopes/ExoplanetC23";

export default function TestPage() {
    return (
        <StarnetLayout>
            <div className="1">
                <ExoplanetTransitHunter />
            </div>
        </StarnetLayout>
    );
}