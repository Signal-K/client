import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";

const EmergenceComponent: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
            <h1 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500"> The emergence of a Star Sailor </h1>
            <div className="container mx-auto py-8">
                <h2 className="text-2xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500"> Embarking on your cosmic journey </h2>
                <p className="text-gray-700">Welcome to the Star Sailors universe, where the cosmos is your playground. Before you begin, let's acquaint you with the fundamentals that every Star Sailor needs to know.</p> <br />
            </div>
            <div className="mb-10"><img src="/assets/Onboarding/Missions/Emergence/EmergenceImage1.png" alt="Transit Method" className="w-full" /></div> <br />
            <div className="container mx-auto py-8">
                <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500"> Planets and Exoplanets: Your New Frontier </h2>
                <p className="text-gray-700">
                    - Planets: Celestial bodies revolving around a star, with a nearly spherical shape, paving the way for your explorations in the Star Sailors universe. <br />
                    - Exoplanets: Mysterious worlds orbiting stars in other solar systems, holding secrets and potentially groundbreaking discoveries.
                </p><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Quick Fact: The study of exoplanets can potentially unveil other life-sustaining environments in the cosmos.</p>
                </blockquote>
            </div>
            <div className="mb-10 flex space-x-4">
                <div className="w-1/2">
                    <img src="/assets/Onboarding/Missions/Emergence/EmergenceImage2.png" alt="Transit Method" className="w-full h-auto" />
                </div>
                <div className="w-1/2">
                    <img src="/assets/Onboarding/Missions/Emergence/EmergenceImage3.png" alt="Another Image" className="w-full h-auto" />
                </div>
            </div><br />
            <div className="container mx-auto py-8">
                <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500"> Crafting Your Star Sailor Avatar </h2>
                <ul className="list-disc list-inside ml-6">
                    <li className="text-lg">Design Your Avatar: Choose from a range of cosmic-inspired outfits and appearances.</li>
                    <li className="text-lg">Choose a Backstory: Are you a cosmic scientist or a starry warrior? Your choice will shape your adventures.</li>
                    <li className="text-lg">Set Your Cosmic Goal: Define your mission in the universe, learn different citizen science disciplines along the way to help you better uncover new homes, habitats, desolate space rocks, and solve cosmic mysteries.</li>
                </ul><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Tip: Share your avatar and backstory in the Star Sailor community and start connecting with fellow explorers.</p>
                </blockquote>
            </div>
        </div>
    );
};

export default EmergenceComponent;