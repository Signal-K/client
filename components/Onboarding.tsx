"use client";

import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlanetCard } from "./Content/Anomalies/PlanetData";

type Planet = {
  id: string;
  type: string;
  avatar_url: string;
  content: string;
};

type PickYourPlanetProps = {
    onPlanetSelect: (planetId: string) => void;
  };
  
  export default function PickYourPlanet({ onPlanetSelect }: PickYourPlanetProps) {
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const router = useRouter();
    
    const { activePlanet, setActivePlanet } = useActivePlanet();
    const [planetList, setPlanetList] = useState<Planet[]>([]);
    const [loading, setLoading] = useState(false);
  
    async function fetchPlanets() {
      // if (!activePlanet) {
        try {
          setLoading(true);
          const { data: planetsData, error: planetsError } = await supabase
            .from("anomalies")
            .select("*");
          
          if (planetsData) {
            setPlanetList(planetsData);
          };
  
          if (planetsError) {
            console.error("Error fetching planets: ", planetsError);
          }
        } catch (error: any) {
          console.log("Error fetching planets data: ", error);
        } finally {
          setLoading(false);
        }
      // }
    }
  
    useEffect(() => {
      fetchPlanets();
    }, [session]);
  
    return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">Step 1: Pick Your Planet</h1>
        <div className="container grid gap-6 md:gap-8 px-4 md:px-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {planetList.map((planet) => (
                <PlanetCard key={planet.id} planet={planet} onSelect={() => onPlanetSelect(planet.id)} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }