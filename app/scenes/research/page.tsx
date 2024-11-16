"use client";

import React from "react";
import ModernTechTree from "@/components/Structures/Research/TechTree";
import { AdvancedTechTreeComponent } from "@/components/Structures/Research/OldTechTree";

export default function ResearchPage() {
    return ( 
        <div className="min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
            />
            <div className="relative">
                <AdvancedTechTreeComponent />
            </div>
        </div>
    );
};