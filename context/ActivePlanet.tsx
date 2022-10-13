import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserPlanetData } from '@/components/Gameplay/Inventory/UserPlanets';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

// Define the type for the context value
interface ActivePlanetContextValue {
  activePlanet: UserPlanetData | null;
  setActivePlanet: (planet: UserPlanetData | null) => void;
  userSector: any; // Assuming 'any' for simplicity, consider using a more specific type
  setUserSector: (sector: any) => void; // Assuming 'any', consider using a more specific type
}

// Create the context 
const ActivePlanetContext = createContext<ActivePlanetContextValue>({
  activePlanet: null,
  setActivePlanet: () => {},
  userSector: null, // Initialize 'userSector' to match the context provider usage
  setUserSector: () => {}, // Initialize 'setUserSector' to match the context provider usage
});

// Create a provider component
export const ActivePlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activePlanet, setActivePlanet] = useState<UserPlanetData | null>(null);
  const [userSector, setUserSector] = useState<any>(null); // Ensure 'userSector' is initialized

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!session) return;

      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
       .from("profiles")
       .select("location")
       .eq("id", session.user.id)
       .single();

        if (profileError) throw profileError;

        // Fetch user planet
        const { data: planet, error: planetError } = await supabase
       .from("basePlanets")
       .select("*")
       .eq("id", profile.location)
       .single();

        if (planetError) throw planetError;

        if (planet) {
          setActivePlanet(planet);
          // fetchSectorsForPlanet(); // Fetch sectors after setting the active planet
        }
      } catch (error: any) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchPlanetData();
  }, [session, supabase]);

  const fetchSectorsForPlanet = async () => {
    try {
      const { data, error } = await supabase
       .from("basePlanetSectors")
       .select('*')
       .eq("anomaly", activePlanet?.id)
       .eq("owner", session?.user?.id)
       .single();

      if (error) {
          console.error('Error fetching sectors data: ', error.message);
          return;
      }

      setUserSector(data);
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <ActivePlanetContext.Provider value={{ activePlanet, setActivePlanet, userSector, setUserSector }}>
      {children}
    </ActivePlanetContext.Provider>
  );
};

export const useActivePlanet = () => useContext(ActivePlanetContext);
