'use client';

import { useState, useEffect } from 'react';
import { Diamond, Zap, Battery, Magnet, Crown, Gem } from 'lucide-react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

type InventoryItem = {
  id: string;
  name: string;
  amount: number;
};

const getMineralColor = (name: string) => {
  switch (name) {
    case 'Iron':
      return 'bg-red-100';
    case 'Copper':
      return 'bg-orange-100';
    case 'Coal':
      return 'bg-gray-100';
    case 'Nickel':
      return 'bg-green-100';
    case 'Fuel':
      return 'bg-cyan-100';
    default:
      return 'bg-blue-100';
  }
};

export function Inventory() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const itemNames: Record<number, string> = {
    11: 'Coal',
    13: 'Silicon',
    15: 'Iron',
    16: 'Nickel',
    18: 'Fuel',
    19: 'Copper',
  };

  useEffect(() => {
    const fetchInventory = async () => {
      if (!session?.user.id) {
        console.error('Session or user ID is missing');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('id, item, quantity')
          .eq('owner', session.user.id)
          .in('item', Object.keys(itemNames).map(Number));

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
      case 'Coal':
        return <Magnet className="text-[#FFD700]" />;
      case 'Silicon':
        return <Gem className="text-[#B0C4DE]" />;
      case 'Fuel':
        return <Battery className="text-[#020403]" />;
      case 'Nickel':
        return <Crown className="text-[#E5E4E2]" />;
      default:
        return <Diamond className="text-[#FFE3BA]" />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-[#2C4F64]">Inventory</h2>
      <div className="flex flex-wrap gap-4">
        {inventory.map((item) => (
          <div
            key={item.id}
            className={`relative flex items-center space-x-2 p-2 rounded-lg ${getMineralColor(item.name)}`}
            onMouseEnter={() => setHoveredItem(item.name)} // Use name for hover
            onMouseLeave={() => setHoveredItem(null)}
          >
            {getIcon(item.name)}
            <span className="font-bold">{item.amount}</span>
            {hoveredItem === item.name && ( // Compare against name
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-[#2C4F64] text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};