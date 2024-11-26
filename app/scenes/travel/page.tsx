"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import SwitchPlanet from "@/components/(scenes)/travel/SolarSystem";
import StarnetLayout from "@/components/Layout/Starnet";

import PlanetSelector from "@/components/(scenes)/travel/PlanetSelector";

export default function Home() {
    const session = useSession();

    const mockUser = {
        id: "1",
        name: session?.user?.id || "Guest",
        avatar: "/placeholder.svg?height=40&width=40",
        frequentFlyerNumber: "SF123456",
        frequentFlyerStatus: "Gold" as "Gold",
    };

    return (
        <main className="min-h-screen bg-[#1D2833] text-[#F7F5E9] p-4 sm:p-6 md:p-8">
            <PlanetSelector 
                user={mockUser} 
                onSelect={(planet) => console.log("Selected planet:", planet.name)} 
            />
        </main>
    );
};


// export default function Travel() {
//     return (
//         <StarnetLayout>
//             <main className="container mx-auto px-4 py-6 relative z-8">
//                 {/* <center><SwitchPlanet /></center> */}
//             </main>
//         </StarnetLayout>
//     )
// };