"use client"

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
          console.error("Error fetching planets: ", planetsError);
        }
      } catch (error: any) {
        console.log("Error fetching planets data: ", error);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchPlanets();
  }, [session]);

  if (activePlanet) {
    return (
      <section className="py-2 md:py-4 lg:py-6">
        <div className="container grid gap-4 md:gap-6 px-2 md:px-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
              {planetList.map((planet) => (
                <PlanetCard key={planet.id} planet={planet} onSelect={() => {}} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <section className="py-2 md:py-4 lg:py-6">
      <div className="container grid gap-4 md:gap-6 px-2 md:px-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
            {planetList.map((planet) => (
              <PlanetCard key={planet.id} planet={planet} onSelect={() => onPlanetSelect(planet.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
