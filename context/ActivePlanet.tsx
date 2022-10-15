import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context value
interface ActivePlanetContextValue {
  activePlanet: any; // Update this to the appropriate type
  setActivePlanet: React.Dispatch<React.SetStateAction<any>>; // Update this to the appropriate type
}

// Create the context
const ActivePlanetContext = createContext<ActivePlanetContextValue>({
  activePlanet: null,
  setActivePlanet: () => {} // Provide a default empty function
});

// Create a provider component
export const ActivePlanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePlanet, setActivePlanet] = useState<any>(null); // Update this to the appropriate type

  return (
    <ActivePlanetContext.Provider value={{ activePlanet, setActivePlanet }}>
      {children}
    </ActivePlanetContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useActivePlanet = () => useContext(ActivePlanetContext);
