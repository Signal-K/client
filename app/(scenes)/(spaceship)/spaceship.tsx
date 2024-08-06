"use client"

import { ReactNode, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
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
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [anomalyData, setAnomalyData] = useState<any>(null);

    useEffect(() => {
        const fetchAnomalyData = async () => {
            if (activePlanet && activePlanet.id) {
                try {
                    const { data, error } = await supabase
                        .from("anomalies")
                        .select("*")
                        .eq("id", activePlanet.id)
                        .single();

                    if (error) throw error;

                    setAnomalyData(data);
                } catch (error: any) {
                    console.error("Error fetching anomaly data: ", error.message);
                }
            }
        };

        fetchAnomalyData();
    }, [activePlanet, supabase]);

    const getTextColor = (value: any) => {
        if (value === "Unknown" || !value) return "text-gray-400";
        if (parseFloat(value) < 1) return "text-red-500";
        if (parseFloat(value) > 1 && parseFloat(value) < 2) return "text-yellow-500";
        return "text-green-500";
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-between">
                <div className="flex flex-col items-center p-6 text-white">
                    <div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg shadow-lg text-gray-900 w-max">
                        <h1 className={`text-3xl font-bold ${getTextColor(anomalyData?.content)}`}>{anomalyData?.content || "ETHERON"}</h1>
                        <p className={`mt-4 text-lg ${getTextColor(anomalyData?.anomalytype)}`}>Anomaly type: {anomalyData?.anomalytype || "Galaxy: Sombrero"}</p>
                        <p className={`mt-2 text-lg ${getTextColor(anomalyData?.configuration?.radius)}`}>Radius: {anomalyData?.configuration?.radius || "Unknown"} Earth radii*</p>
                        <p className={`mt-2 text-lg ${getTextColor(anomalyData?.configuration?.orbital_period)}`}>Year Length: {anomalyData?.configuration?.orbital_period || "Unknown"} days</p>
                        <p className={`mt-2 text-lg ${getTextColor(anomalyData?.configuration?.temperature_eq)}`}>Equilibrium Temperature: {anomalyData?.configuration?.temperature_eq || "Unknown"}°C</p>
                        {/* <p className="mt-2 text-lg">Climate: {anomalyData?.classification_status || "Unknown"}</p> */}
                    </div>
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
                <div className="py-5">
                    <AllStructures itemsPerPage={4} />
                </div>
                <div className="bg-black bg-opacity-75 p-4 flex justify-around items-center">
                    {/* <Link legacyBehavior href="/home">
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
                    </Link> */}
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