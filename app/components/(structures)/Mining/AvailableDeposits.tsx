"use client";
 
import React, { useEffect, useState } from 'react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const MineralDeposit: React.FC<MineralDepositProps> = ({ deposit, inventoryItems }) => {
  const getInventoryItem = (itemId: string) => {
    return inventoryItems.find(item => item.id === parseInt(itemId));
  };

  const inventoryItem = getInventoryItem(deposit.mineralconfiguration.mineral);

  return (
    <div className="w-full h-32 bg-gray-50 rounded-md shadow-md flex items-center justify-center">
      {inventoryItem ? (
        <div className="text-center">
          <img src={inventoryItem.icon_url} alt={inventoryItem.name} className="w-16 h-16 mb-2 mx-auto" />
          <h2 className="text-sm font-semibold">{inventoryItem.name}</h2>
          <p className="text-xs">Quantity: {deposit.mineralconfiguration.quantity}</p>
        </div>
      ) : (
        // <div className="w-full h-full bg-gray-400/80 rounded-md flex items-center justify-center">
        // </div>
        <div className='bg-opacity-10'></div>
      )}
    </div>
  );
};

interface InventoryItem {
  id: number;
  name: string;
  icon_url: string;
}

interface MineralDepositData {
  id: number;
  anomaly: number;
  owner: string;
  mineralconfiguration: {
    mineral: string;
    quantity: number;
  };
}

const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch('/api/gameplay/inventory');
  const data = await response.json();
  return data;
};

const MineralDeposits: React.FC<{ onSelectDeposit: (deposit: MineralDepositData) => void }> = ({ onSelectDeposit }) => {
  const { activePlanet } = useActivePlanet();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [mineralDeposits, setMineralDeposits] = useState<MineralDepositData[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchMineralDeposits = async () => {
      if (!activePlanet || !session) return;

      try {
        const { data, error } = await supabase
          .from('mineralDeposits')
          .select('*')
          .eq('anomaly', activePlanet.id)
          .eq('owner', session.user.id);

        if (error) throw error;

        setMineralDeposits(data);
      } catch (error) {
        console.error('Error fetching mineral deposits:', error);
      }
    };

    const loadInventoryItems = async () => {
      try {
        const items = await fetchInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchMineralDeposits();
    loadInventoryItems();
  }, [activePlanet, session, supabase]);

  const emptySlots = 9 - mineralDeposits.length; // Calculate how many empty slots to display

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mineral Deposits</h1>
      <div className="grid grid-cols-3 gap-4">
        {[...mineralDeposits, ...Array(emptySlots).fill(null)].map((deposit, index) => (
          <div key={index} onClick={() => deposit && onSelectDeposit(deposit)} className="cursor-pointer">
            <MineralDeposit deposit={deposit || { id: index, anomaly: 0, owner: '', mineralconfiguration: { mineral: '', quantity: 0 } }} inventoryItems={inventoryItems} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MineralDeposits;

export const MineralDepositsNoAction: React.FC = () => {
  const { activePlanet } = useActivePlanet();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [mineralDeposits, setMineralDeposits] = useState<MineralDepositData[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchMineralDeposits = async () => {
      if (!activePlanet || !session) return;

      try {
        const { data, error } = await supabase
          .from('mineralDeposits')
          .select('*')
          .eq('anomaly', activePlanet.id)
          .eq('owner', session.user.id);

        if (error) throw error;

        setMineralDeposits(data);
      } catch (error) {
        console.error('Error fetching mineral deposits:', error);
      }
    };

    const loadInventoryItems = async () => {
      try {
        const items = await fetchInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchMineralDeposits();
    loadInventoryItems();
  }, [activePlanet, session, supabase]);

  const emptySlots = 9 - mineralDeposits.length;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mineral Deposits</h1>
      <div className="grid grid-cols-3 gap-4">
        {[...mineralDeposits, ...Array(emptySlots).fill(null)].map((deposit, index) => (
          <div key={index} className="cursor-default">
            <MineralDeposit 
              deposit={deposit || { id: index, anomaly: 0, owner: '', mineralconfiguration: { mineral: '', quantity: 0 } }} 
              inventoryItems={inventoryItems} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};


interface InventoryItem {
  id: number;
  name: string;
  icon_url: string;
};

interface MineralDeposit {
  id: number;
  anomaly: number;
  owner: string;
  mineralconfiguration: {
    mineral: string;
    quantity: number;
  };
};

interface MineralDepositProps {
  deposit: {
    id: number;
    anomaly: number;
    owner: string;
    mineralconfiguration: {
      mineral: string;
      quantity: number;
    };
  };
  inventoryItems: InventoryItem[];
};