'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Diamond, Zap, Gem, Rocket, Crown } from 'lucide-react';
import { useActivePlanet } from '@/context/ActivePlanet';

type InventoryItem = {
  id: string;
  name: string;
  amount: number;
};

export function Inventory() {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const { activePlanet } = useActivePlanet();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Mapping item IDs to their names
  const itemNames: Record<number, string> = {
    11: 'Iron',
    19: 'Fuel',
    20: 'Copper',
  };

  useEffect(() => {
    const fetchInventory = async () => {
      // Check if session and user ID are available
      if (!session?.user?.id) {
        console.error('Session or user ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('id, item, quantity')
          .eq('owner', session.user.id)
          .in('item', Object.keys(itemNames).map(Number)); // Fetch all items defined

        if (error) {
          throw error;
        }

        const formattedInventory = Object.entries(itemNames).map(([key, name]) => {
          const foundItem = data?.find((item) => item.item === Number(key));
          return {
            id: foundItem ? foundItem.id.toString() : key, 
            name: name,
            amount: foundItem ? foundItem.quantity : 0,
          };
        });

        setInventory(formattedInventory);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [session, supabase]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Iron':
        return <Diamond className="text-[#FFE3BA]" />;
      case 'Copper':
        return <Zap className="text-[#5FCBC3]" />;
      case 'Gold':
        return <Gem className="text-[#FFD700]" />;
      case 'Titanium':
        return <Rocket className="text-[#B0C4DE]" />;
      case 'Platinum':
        return <Crown className="text-[#E5E4E2]" />;
      default:
        return <Diamond className="text-[#FFE3BA]" />;
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-[#B9E678]">Inventory</h2>              
      <div className="flex space-x-4">
        {inventory.map((item) => (
          <div 
            key={item.id} 
            className="relative flex items-center space-x-2 bg-[#2C4F64] p-2 rounded-lg"             
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {getIcon(item.name)}
            <span className="font-bold text-[#F7F5E9]">{item.amount}</span>             
            {hoveredItem === item.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[#2C4F64] text-[#F7F5E9] px-2 py-1 rounded text-sm whitespace-nowrap">              
                {item.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};