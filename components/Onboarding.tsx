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

export function PickYourPlanet() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();
  
  const { activePlanet, setActivePlanet } = useActivePlanet();
  const [planetList, setPlanetList] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPlanets() {
    if (!activePlanet) {
      try {
        setLoading(true);
        const { data: planetsData, error: planetsError } = await supabase
          .from("anomalies")
          .select("*");
        
        if (planetsData) {
          setPlanetList(planetsData);
        }

        if (planetsError) {
          console.error("Error fetching planets; try: ", planetsError);
        }
      } catch (error: any) {
        console.log("Error fetching planets data; catch: ", error);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchPlanets();
  }, [session]);

  if (activePlanet) {
    router.push('/');
  }

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {planetList.map((planet) => (
            <PlanetCard key={planet.id} planet={planet} />
          ))}
        </div>
      )}
    </div>
  );
}