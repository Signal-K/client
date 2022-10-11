import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserPlanetData } from '@/components/Gameplay/Inventory/UserPlanets';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

interface ActivePlanetContextValue {
  activePlanet: UserPlanetData | null;
  setActivePlanet: (planet: UserPlanetData | null) => void;
  activeSector: any; // Updated to include sector information
  setActiveSector: (sector: any) => void; // Function to update sector information
}

const ActivePlanetContext = createContext<ActivePlanetContextValue>({
  activePlanet: null,
  setActivePlanet: () => {},
  activeSector: null, // Initialize sector as null
  setActiveSector: () => {}, // Provide a default empty function
});

export const ActivePlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activePlanet, setActivePlanet] = useState<UserPlanetData | null>(null);
  const [activeSector, setActiveSector] = useState<any>(null); // State for sector

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!session) return;

      try {
        const { data: profile, error: profileError } = await supabase
         .from("profiles")
         .select("location")
         .eq("id", session.user.id)
         .single();

        if (profileError) throw profileError;

        const { data: planet, error: planetError } = await supabase
         .from("basePlanets")
         .select("*")
         .eq("id", profile.location)
         .single();

        if (planetError) throw planetError;

        if (planet) {
          setActivePlanet(planet);

          // Check for existing sector or create a new one
          const { data: sectors, error: sectorsError } = await supabase
           .from("basePlanetSectors")
           .select("*")
           .eq("owner", session.user.id)
           .eq("anomaly", planet.id)
           .single();

          if (sectorsError) throw sectorsError;

          if (!sectors) {
            // Create a new sector if none exists
            const newSector = await supabase
             .from("basePlanetSectors")
             .insert([
                {
                  owner: session.user.id,
                  anomaly: planet.id,
                  deposit: Math.floor(Math.random() * 7) + 15, // Random number between 15 and 21
                  created_at: new Date(),
                  explored: false,
                  note: "first sector created by user",
                },
              ]);

            if (newSector.error) throw newSector.error;

            setActiveSector(newSector.data[0]); // Update state with the newly created sector
          } else {
            setActiveSector(sectors); // Update state with the existing sector
          }
        }
      } catch (error: any) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchPlanetData();
  }, [session, supabase]);

  return (
    <ActivePlanetContext.Provider value={{ activePlanet, setActivePlanet, activeSector, setActiveSector }}>
      {children}
    </ActivePlanetContext.Provider>
  );
};

export const useActivePlanet = () => useContext(ActivePlanetContext);
