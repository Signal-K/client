"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { UserPlanetData } from '@/components/Gameplay/Inventory/UserPlanets';

// Define the type for the context value
interface ActivePlanetContextValue {
  activePlanet: any | null;
  setActivePlanet: (planet: any | null) => void;
  updatePlanetLocation: (newLocation: number) => void;
  classifications: any[];
  setClassifications: (classifications: any[]) => void;
}

// Create the context
const ActivePlanetContext = createContext<ActivePlanetContextValue>({
  activePlanet: null,
  setActivePlanet: () => {},
  updatePlanetLocation: () => {},
  classifications: [],
  setClassifications: () => {},
});

// Create a provider component
export const ActivePlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activePlanet, setActivePlanet] = useState<any | null>(null);
  const [classifications, setClassifications] = useState<any[]>([]);

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
          .from("anomalies")
          .select("*")
          .eq("id", profile.location)
          .single();

        if (planetError) throw planetError;

        if (planet) {
          setActivePlanet(planet);

          const { data: classificationsData, error: classificationsError } = await supabase
            .from('classifications')
            .select('*')
            .eq('author', session.user.id)
            .eq('anomaly', planet.id)
            .eq('classificationtype', 'lightcurve');

          if (classificationsError) throw classificationsError;

          setClassifications(classificationsData);
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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ location: newLocation })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      const { data: planet, error: planetError } = await supabase
        .from("anomalies")
        .select("*")
        .eq("id", newLocation)
        .single();

      if (planetError) throw planetError;

      if (planet) {
        setActivePlanet(planet);

        const { data: classificationsData, error: classificationsError } = await supabase
          .from('classifications')
          .select('*')
          .eq('author', session.user.id)
          .eq('anomaly', planet.id)
          .eq('classificationtype', 'lightcurve');

        if (classificationsError) throw classificationsError;

        setClassifications(classificationsData);
      }
    } catch (error: any) {
      console.error("Error updating planet location: ", error.message);
    }
  };

  return (
    <ActivePlanetContext.Provider value={{ activePlanet, setActivePlanet, updatePlanetLocation, classifications, setClassifications }}>
      {children}
    </ActivePlanetContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useActivePlanet = () => useContext(ActivePlanetContext);