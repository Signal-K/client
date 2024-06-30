"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserPlanetData } from '@/components/Gameplay/Inventory/UserPlanets';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

// Define the type for the context value
interface ActivePlanetContextValue {
  activePlanet: UserPlanetData | null;
  setActivePlanet: (planet: UserPlanetData | null) => void;
  updatePlanetLocation: (newLocation: number) => void;
}

// Create the context 
const ActivePlanetContext = createContext<ActivePlanetContextValue>({
  activePlanet: null,
  setActivePlanet: () => {}, // Provide a default empty function
  updatePlanetLocation: () => {}, // Provide a default empty function
});

// Create a provider component
export const ActivePlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activePlanet, setActivePlanet] = useState<UserPlanetData | null>(null);

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
          .from("anomalies")
          .select("*")
          .eq("id", profile.location)
          .single();

        if (planetError) throw planetError;

        if (planet) {
          setActivePlanet(planet);
        }
      } catch (error: any) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchPlanetData();
  }, [session, supabase]);

  const updatePlanetLocation = async (newLocation: number) => {
      if (!session) return;

    try {
        // Update the location in the profiles table
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ location: newLocation })
            .eq('id', session.user.id);

        if (updateError) throw updateError;

        // Fetch the new planet data
        const { data: planet, error: planetError } = await supabase
            .from("anomalies")
            .select("*")
            .eq("id", newLocation)
            .single();

        if (planetError) throw planetError;

        if (planet) {
            setActivePlanet(planet);
        }
    } catch (error: any) {
        console.error("Error updating planet location: ", error.message);
    }
  };


  return (
    <ActivePlanetContext.Provider value={{ activePlanet, setActivePlanet, updatePlanetLocation }}>
      {children}
    </ActivePlanetContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useActivePlanet = () => useContext(ActivePlanetContext);
