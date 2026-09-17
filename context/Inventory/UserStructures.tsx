import React, { createContext, useContext, useEffect, useState } from 'react';

// Define types for the context state and functions
type Structure = {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: Record<string, number>;
};

type StructureContextType = {
  structures: Structure[];
  loading: boolean;
};

// Create the context with default values
const StructureContext = createContext<StructureContextType | undefined>(undefined);

// Context provider component
export const StructureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch structures from the API
  const fetchStructures = async () => {
    try {
      const response = await fetch('/api/gameplay/inventory');
      const inventoryItems: Structure[] = await response.json();
      const filteredStructures = inventoryItems.filter(item => item.ItemCategory === 'Structure');
      setStructures(filteredStructures);
    } catch (error) {
      console.error('Failed to fetch structures', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  return (
    <StructureContext.Provider value={{ structures, loading }}>
      {children}
    </StructureContext.Provider>
  );
};

// Custom hook for using the StructureContext
export const useStructures = () => {
  const context = useContext(StructureContext);
  if (context === undefined) {
    throw new Error('useStructures must be used within a StructureProvider');
  }
  return context;
};
