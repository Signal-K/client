"use client"

import { ReactNode } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon, PodcastIcon, MagnetIcon, ScissorsIcon, TicketCheckIcon, SettingsIcon } from "lucide-react"; // Importing icons from Lucide
import { useActivePlanet } from "@/context/ActivePlanet";
import { AllStructures } from "@/app/(structures)/StructuresInNav";

interface GamePageProps {
    children: ReactNode;
};

const Navbar = () => {
    return (
        <header className="bg-black shadow">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="flex items-center">
                    <Link legacyBehavior href="/">
                        <a className="text-2xl font-bold text-white">Space Game</a>
                    </Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link legacyBehavior href="/home">
                        <a className="text-gray-400 hover:text-white">Home</a>
                    </Link>
                    <Link legacyBehavior href="/feed">
                        <a className="text-gray-400 hover:text-white">Feed</a>
                    </Link>
                    <Link legacyBehavior href="/explore">
                        <a className="text-gray-400 hover:text-white">Explore</a>
                    </Link>
                    <Link legacyBehavior href="/gather">
                        <a className="text-gray-400 hover:text-white">Gather</a>
                    </Link>
                    <Link legacyBehavior href="/missions">
                        <a className="text-gray-400 hover:text-white">Missions</a>
                    </Link>
                    {/* <Link legacyBehavior href="/settings">
                        <a className="text-gray-400 hover:text-white">Settings</a>
                    </Link> */}
                </nav>
            </div>
        </header>
    );
};

function GameWrapper({ children }: { children: ReactNode }) {
    const { activePlanet } = useActivePlanet();

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-between">
                <div className="p-6 text-white">
                    <h1 className="text-3xl font-bold">ETHERON</h1>
                    <p className="mt-4 text-lg">Galaxy: Sombrero</p>
                    <p className="mt-2 text-lg">Diameter: 542,700 km</p>
                    <p className="mt-2 text-lg">Day Length: 12 Earth hours</p>
                    <p className="mt-2 text-lg">Avg Temperature: 60°C to 80°C</p>
                    <p className="mt-2 text-lg">Climate: Tropical</p>
                </div>
                <div className="flex-grow flex justify-center items-center">
                    {activePlanet && (
                        <img 
                            src={`https://hlufptwhzkpkkjztimzo.supabase.co/storage/v1/object/public/anomalies/${activePlanet.id}/1.png`} 
                            alt="Planet" 
                            className="w-32 h-32 object-contain z-10" 
                        />
                    )}
                </div>
                <AllStructures itemsPerPage={1} />
                <div className="bg-black bg-opacity-75 p-4 flex justify-around items-center">
                    <Link legacyBehavior href="/home">
                        <a className="text-white flex flex-col items-center">
                            <HomeIcon className="h-6 w-6" />
                            Home
                        </a>
                    </Link>
                    <Link legacyBehavior href="/feed">
                        <a className="text-white flex flex-col items-center">
                            <PodcastIcon className="h-6 w-6" />
                            Feed
                        </a>
                    </Link>
                    <Link legacyBehavior href="/explore">
                        <a className="text-white flex flex-col items-center">
                            <ScissorsIcon className="h-6 w-6" />
                            Explore
                        </a>
                    </Link>
                    <Link legacyBehavior href="/gather">
                        <a className="text-white flex flex-col items-center">
                            <TicketCheckIcon className="h-6 w-6" />
                            Gather
                        </a>
                    </Link>
                    <Link legacyBehavior href="/missions">
                        <a className="text-white flex flex-col items-center">
                            <SettingsIcon className="h-6 w-6" />
                            Missions
                        </a>
                    </Link>
                    {/* <Link legacyBehavior href="/settings">
                        <a className="text-white flex flex-col items-center">
                            <SettingsIcon className="h-6 w-6" />
                            Settings
                        </a>
                    </Link> */}
                </div>
            </div>
        </div>
    );
}

function GamePage({ children }: GamePageProps) {
    return (
        <GameWrapper>
            {children}
        </GameWrapper>
    );
}

export default function SpaceGamePage() {
    const supabase = useSupabaseClient();

    return (
        <GamePage>
            <></>
        </GamePage>
    );
}