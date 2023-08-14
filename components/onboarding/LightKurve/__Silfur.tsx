import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";

const SilfurComponentOnboarding3: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans mb-20">
            <div className="mb-10">
                <img
                    src="/assets/Onboarding/Missions/Silfur/SilfurImage1.png"
                    alt="Transit Method"
                    className="w-full"
                />
            </div> <br />
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Cosmic Exploration and Silfur Economy</h1>
                <p className="text-gray-700">Welcome to the next phase of your cosmic odyssey, Star Sailor. In this chapter, we will delve deep into your most valuable companion, the Solar Starship, and explore the cosmic currency known as Silfur, which will shape your journey in the vastness of the cosmos.</p>
            </div>
        </div>
    );
};

export default SilfurComponentOnboarding3;