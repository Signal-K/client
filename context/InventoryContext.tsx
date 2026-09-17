"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { InventoryItem } from '@/types/Items';

interface InventoryContextType {
  inventoryItems: { [key: number]: InventoryItem };
};

const InventoryContext = createContext<InventoryContextType>({ inventoryItems: {} });

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [inventoryItems, setInventoryItems] = useState<{ [key: number]: InventoryItem }>({});

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch('/api/gameplay/inventory');
        const items: InventoryItem[] = await response.json();
        const itemsDictionary = items.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as { [key: number]: InventoryItem });
        setInventoryItems(itemsDictionary);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  return (
    <InventoryContext.Provider value={{ inventoryItems }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);