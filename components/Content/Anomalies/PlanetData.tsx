"use client"

import { useActivePlanet } from "@/context/ActivePlanet";
import { CloudIcon, FireExtinguisherIcon, GlassWaterIcon, GlobeIcon, SquareIcon } from "@/ui/icons/PlanetTypes";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type PlanetDataType = {
    id: string;
    Configuration: string;
    type: string;
    [key: string]: any;
};

export default function PlanetData() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    const [planetData, setPlanetData] = useState<PlanetDataType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function getPlanetData() {
        if (!activePlanet?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data: planetInfo, error: planetError } = await supabase
                .from("anomalies")
                .select("*")
                .eq("id", activePlanet.id)
                .order("id", { ascending: true })
                .single();

            if (planetError) {
                throw planetError;
            }

            setPlanetData(planetInfo);
            console.log(planetData);
        } catch (error: any) {
            console.error("Error fetching anomaly-planet data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            getPlanetData();
        };
    }, [session]);

    return (
        <div className="p-4 rounded-md">
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {planetData ? (
                <div>
                    <h2 className="text-2xl font-bold mb-2">Planet Configuration</h2>
                    <p>{planetData.Configuration}</p>
                    <p>Planet ID: {planetData.id}. Planet type: {planetData.type}.</p>
                    {/* Render more data as needed. Convert configuration components */}
                </div>
            ) : (
                !loading && <p>No planet data available.</p>
            )}
        </div>
    );
};
  

type Planet = {
    id: string;
    type: string;
    avatar_url: string;
    content: string;
  };
  
  type PlanetCardProps = {
    planet: Planet;
    onSelect: () => void; // Add onSelect prop
  };
  
export function PlanetCard({ planet, onSelect }: PlanetCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Terrestrial Planet':
        return <GlobeIcon className="h-4 w-4" />;
      case 'Gaseous Planet':
        return <CloudIcon className="h-4 w-4" />;
      case 'Ocean Terrestrial Planet':
      case 'Ocean Planet':
        return <GlassWaterIcon className="h-4 w-4" />;
      case 'Volcanic Planet':
        return <FireExtinguisherIcon className="h-4 w-4" />;
      case 'Asteroid':
        return <SquareIcon className="h-4 w-4" />;
      default:
        return <GlobeIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative group grid [grid-template-areas:stack] overflow-hidden rounded-lg aspect-square" onClick={onSelect}>
      <Link href="#" className="absolute inset-0 z-10" prefetch={false}>
        <span className="sr-only">View</span>
      </Link>
      <img
        src={planet.avatar_url || "/placeholder.svg"}
        alt={planet.type}
        className="[grid-area:stack] object-cover w-full h-full"
      />
      <div className="flex-1 [grid-area:stack] bg-black/40 group-hover:opacity-90 transition-opacity text-white p-2 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold">{planet.type} - {planet.id}</h3>
          {getIcon(planet.type)}
        </div>
        <p className="text-xs">{planet.content}</p>
      </div>
    </div>
  );
};