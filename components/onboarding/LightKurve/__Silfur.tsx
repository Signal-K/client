import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";

const SilfurComponentOnboarding3: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const solarSpaceships = [
        {
            name: 'Ship1', icon: '/assets/Onboarding/Missions/Silfur/SolarShip1.png',
        },
        {
            name: 'Ship2', icon: '/assets/Onboarding/Missions/Silfur/SolarShip2.png',
        },
        {
            name: 'Ship3', icon: '/assets/Onboarding/Missions/Silfur/SolarShip3.png',
        },
    ];

    const gameItemsDemo = [
        {
            name: 'Universal Compass', icon: '/assets/Onboarding/Missions/Silfur/GameItem1.png',
        },
        {
            name: 'Spectrum Light Camera', icon: '/assets/Onboarding/Missions/Silfur/GameItem2.png',
        },
        {
            name: 'Satellite Drone', icon: '/assets/Onboarding/Missions/Silfur/GameItem3.png',
        },
    ];

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
            <div className="container mx-auto py-8 mb-10">
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
                <p className="text-gray-700">Each faction has a unique set of missions tailored to their expertise. Whether it's exploring uncharted star systems, conducting scientific experiments, or engaging in diplomatic endeavours with alien civilisations, your starship will be your faithful companion on these missions. The success of these missions not only advances your faction's goals but also adds to the collective knowledge of the Star Sailors community.</p><br />
                <blockquote className="italic bg-yellow p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Data Collection: - Understand how each mission contributes to the accumulation of valuable data that aids not only your faction but the entire Star Sailors community in unravelling the cosmic mysteries.</p>
                </blockquote><br />
                <p className="text-gray-700">As you embark on these missions, your starship will collect a wealth of data, from astronomical observations to geological samples. This data is not only essential for achieving mission objectives but also plays a crucial role in advancing the field of space exploration. By sharing your findings and contributing to the community's knowledge base, you become an integral part of the cosmic quest for understanding.</p>
            </div>
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Silfur - The Cosmic Currency</h1>
                <p className="text-gray-700">Silfur plays a pivotal role in your adventures. In this section, we will unravel the intricacies of Silfur and explore how it empowers you to delve deeper into the mysteries of space.</p><br />
                <h3 className="text-xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Starship Upgrades</h3>
                <p className="text-gray-700">Your starship is not static; it can evolve and grow with the infusion of Silfur. Learn how to allocate this cosmic currency to augment your starship's capabilities, allowing you to venture further and explore the cosmos with increasing precision.</p><br />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                {gameItemsDemo.map((gameItemsDemo) => (
                    <div key={gameItemsDemo.name}>
                        <img src={gameItemsDemo.icon} alt='test' className="w-48 h-48 mx-auto" />
                    </div>
                ))}
            </div><br />
            <div className="container mx-auto py-8 mb-10">
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Upgrade Options: - Explore the myriad of enhancements available for your starship, from advanced sensors to propulsion systems, each offering a unique advantage in your cosmic pursuits.</p>
                </blockquote><br />
                <p className="text-gray-700">Silfur can be invested in various upgrades for your starship. These upgrades range from state-of-the-art sensors that enhance your ability to detect celestial phenomena to advanced propulsion systems that extend your reach into the cosmos. Choosing the right upgrades will be crucial in shaping your starship to match your exploration style and objectives.</p><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Strategic Investments: - Understand the art of strategic spending. Carefully choose which upgrades align with your objectives, whether it's deep-space exploration, data analysis, or combat readiness.</p>
                </blockquote><br />
                <p className="text-gray-700">Silfur is a limited resource, and wise investments are essential. Consider your long-term goals as a Star Sailor and prioritise upgrades that align with your faction's objectives and your personal exploration ambitions. Each choice you make will impact the capabilities of your starship and the success of your cosmic missions.</p><br />

                <h3 className="text-xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Trading and Collaboration</h3>
                <p className="text-gray-700">Silfur is not just a solitary resource; it is a currency that fosters cooperation and resource exchange among Star Sailors. Delve into the dynamics of engaging in trade with your fellow explorers, forging alliances, and enhancing your exploratory goals through collaboration.</p><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">Trade Routes: - Learn about the established trade routes within the Star Sailors community, connecting distant star systems and enabling the exchange of resources, knowledge, and discoveries.</p>
                </blockquote><br />
                <p className="text-gray-700">As a Star Sailor, you have the opportunity to engage in trade with other explorers. Established trade routes connect different star systems, allowing for the exchange of valuable resources, knowledge, and discoveries. By participating in trade, you can acquire essential items and data that will aid you on your cosmic journey.</p><br />
                <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
                    <p className="text-gray-700">
                        Collaborative Endeavours: - Explore the opportunities for collaboration with other Star Sailors. By pooling your resources and expertise, you can embark on ambitious missions, share valuable data, and collectively advance the frontiers of space exploration.
                    </p>
                </blockquote><br />
                <p className="text-gray-700">Collaboration is at the heart of the Star Sailors community. Join forces with fellow explorers to tackle complex missions, analyse data, and uncover the secrets of the cosmos. By working together, you can achieve more significant discoveries and contribute to the collective knowledge of the universe.</p>
            </div>
            <h3 className="text-md font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">You have now gained the knowledge and skills necessary to wield your Solar Starship effectively and harness the power of Silfur, propelling you further into the cosmos and towards the enigmatic horizons of the universe. - See you soon, Star Sailor!</h3>
            <Link href='/tests/onboarding/'><button className="btn glass">Next mission</button></Link>
        </div>
    );
};

export default SilfurComponentOnboarding3;