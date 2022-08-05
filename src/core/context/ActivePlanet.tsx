"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/src/lib/auth/session-context';

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
  const session = useSession();
  const [activePlanet, setActivePlanet] = useState<any | null>(null);
  const [classifications, setClassifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/gameplay/active-planet?userId=${encodeURIComponent(session.user.id)}`
        );
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch active planet data");
        }

        setActivePlanet(result?.planet ?? null);
        setClassifications(Array.isArray(result?.classifications) ? result.classifications : []);
      } catch (error: any) {
        console.error("Error fetching data: ", error.message);
      }
    };

    fetchPlanetData();
  }, [session]);

  const updatePlanetLocation = async (newLocation: number) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/gameplay/active-planet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, location: newLocation }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.error || "Failed to update active planet location");
      }

      setActivePlanet(result?.planet ?? null);
      setClassifications(Array.isArray(result?.classifications) ? result.classifications : []);
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
