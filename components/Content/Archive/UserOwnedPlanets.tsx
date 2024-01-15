import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";

interface OwnedPlanet {
    id: number;
    planet_id: number;
};

interface Planet {
    id: number;
    name: string;
    avatar_url: string;
};

const OwnedPlanetsList: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [ownedPlanets, setOwnedPlanets] = useState([]);
    const [planetDetails, setPlanetDetails] = useState([]);

    useEffect(() => {
        async function fetchOwnedPlanets() {
            if (session) {
                try {
                    const user = session?.user?.id;
                    const { data, error } = await supabase
                        .from("inventoryPLANETS")
                        .select("*")
                        .eq("owner_id", user)

                    if (error) {
                        throw error;
                    };

                    if (data) {
                        setOwnedPlanets(data);
                    }
                } catch (error) {
                    console.error("Error fetching owned planets: ", error);
                };
            }
        }
        
        fetchOwnedPlanets();
    }, [session]);

    useEffect(() => {
        async function fetchPlanetDetails() {
            if (ownedPlanets.length > 0) {
                const planetIds = ownedPlanets.map(planet => planet.planet_id);
                const { data, error } = await supabase
                    .from("planetsss")
                    .select("*")
                    .in("id", planetIds);

                if (error) {
                    console.error("Error fetching planet details: ", error);
                }

                if (data) {
                    setPlanetDetails(data);
                }
            }
        }

        fetchPlanetDetails();
    }, [ownedPlanets]);

    return (
        <>
          <div className="bg-gray-100 p-4">
            <h2 className="text-2xl font-semibold mb-4">Your Planets</h2>
            <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {planetDetails.map((planet, index) => (
                <Link legacyBehavior href={`https://play.skinetics.tech/tests/planets/${planet.id}`}>
                <li key={planet.id} className="bg-white shadow-md p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">{planet.content}</h3>
                  <div className="mb-2">
                    <img src={planet.cover} alt={planet.content} className="w-full h-auto" />
                  </div>
                  {/* Add additional planet details here */}
                </li></Link>
              ))}
            </ul>
          </div>
          <br />
        </>
      );
}

export default OwnedPlanetsList;