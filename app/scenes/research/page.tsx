"use client";

import React from "react";
import ModernTechTree from "@/components/Structures/Research/TechTree";

export default function ResearchPage() {
    return ( 
        <div className="min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
            />
            <div className="relative">
                <ModernTechTree />
            </div>
        </div>
    );
};