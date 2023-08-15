import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";

const SilfurComponentOnboarding3: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const solarSpaceships = [
        {
            name: 'Ship1', icon: '/assets/Onboarding/Missions/Silfur/SolarShip1.png'
        },
        {
            name: 'Ship2', icon: '/assets/Onboarding/Missions/Silfur/SolarShip2.png'
        },
        {
            name: 'Ship3', icon: '/assets/Onboarding/Missions/Silfur/SolarShip3.png'
        },
    ]

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
            </div><br />
            <div className="container mx-auto py-8">
                <h2 className="text-2xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500"> The Solar Starship - Your Cosmic Vessel </h2>
                <p className="text-gray-700">
                    As you take command of your Solar Starship, you step into the heart of your cosmic adventures. Let's unlock the mysteries of this remarkable vessel and discover how it empowers you in your quest for knowledge and exploration.
                </p><br />
                <h3 className="text-xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Planet Classification</h3>
                <p className="text-gray-700">
                    Your starship is not merely a mode of transportation but also a state-of-the-art research platform. Within its advanced systems lies the capability to identify and classify potential exoplanets. Let's delve into how your starship contributes to the collective knowledge of the Star Sailors community.
                </p><br />
                <div className="grid grid-cols-3 gap-4 text-center">
                    {solarSpaceships.map((solarSpaceships) => (
                        <div key={solarSpaceships.name}>
                            <img src={solarSpaceships.icon} alt='test' className="w-48 h-48 mx-auto" />
                        </div>
                    ))}
                </div><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700"> Exoplanet Identification - Learn how to utilise your starship's instruments to spot potential exoplanets in the vast sea of celestial data. </p>
                </blockquote><br />
                <p className="text-gray-700">As a Star Sailor, your starship is equipped with specialised sensors and imaging systems. These instruments can detect minute variations in starlight, a tell-tale sign of a potential exoplanet passing in front of its host star. By carefully analysing the data from these sensors, you can pinpoint potential exoplanets for further study.</p><br />
                <blockquote className="italic bg-yellow p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Classification Tools - Explore the specialised tools on your starship that aid in categorising these newfound celestial bodies, adding to the growing database of cosmic discoveries.</p>
                </blockquote><br />
                <p className="text-gray-700">Once a potential exoplanet is identified, the real work begins. Your starship's classification tools allow you to analyse various attributes of these celestial bodies, such as their size, composition, and orbital characteristics. This information is crucial in understanding the nature of these exoplanets and their potential for harbouring life.</p><br />

                <h3 className="text-xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Faction-Specific Missions</h3>
                <p className="text-gray-700">Your chosen faction defines your path in the cosmos. Now, it's time to learn how to undertake missions that align with your faction's objectives, enhancing your skills and contributing valuable data to the field of space exploration.</p><br />
                <blockquote className="italic bg-yellow p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Mission Planning: - Discover the intricacies of planning and embarking on faction-specific missions. These missions will challenge your abilities and take you to uncharted corners of the cosmos.</p>
                </blockquote><br />
            </div>
        </div>
    );
};

export default SilfurComponentOnboarding3;