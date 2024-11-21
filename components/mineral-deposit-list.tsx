'use client';

import { Button } from "@/components/ui/button"
import { Magnet, Zap, Battery, Diamond } from 'lucide-react'
import React, { useEffect, useState } from "react";

export type MineralDeposit = {
  id: string;
  name: string;
  amount: number;
  mineral: string;
  icon_url: string;
  level: number;
  uses: string[];
  position: { x: number; y: number };
};

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost?: number;
  icon_url: string;
  ItemCategory: string; 
};

type Props = {
  deposits: MineralDeposit[]
  onSelect: (deposit: MineralDeposit) => void
  selectedDeposit: MineralDeposit | null
};

const getMineralIcon = (mineralName: string) => {
  switch (mineralName) {
    case 'Iron':
      return <Magnet className="text-red-500" />
    case 'Copper':
      return <Zap className="text-orange-500" />
    case 'Coal':
      return <Battery className="text-gray-700" />
    case 'Nickel':
      return <Diamond className="text-green-500" />
    default:
      return <Diamond className="text-blue-500" />
  };
};

export function MineralDepositList({ deposits = [], onSelect, selectedDeposit }: Props) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch("/api/gameplay/inventory");
        const data = await response.json();
        setInventoryItems(data);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      };
    };

    fetchInventoryItems();
  }, []);

  const getMineralDetails = (mineralId: string) => {
    const mineral = inventoryItems.find(item => item.id === parseInt(mineralId));
    
    if (!mineral) {
      console.error(`Mineral with ID: ${mineralId} not found in inventory`);
    }

    return mineral
      ? {
          icon: <img src={mineral.icon_url} alt={mineral.name} className="w-6 h-6" />,
          name: mineral.name,
        }
      : {
          icon: <Diamond className="text-[#FFE3BA]" />,
          name: "Unknown Mineral",
        };
  };

  if (inventoryItems.length === 0) {
    return <p>Loading mineral data...</p>;
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[60vh]">
      <h3 className="text-lg font-semibold mb-2">Mineral Deposits</h3>
      {deposits.map((deposit) => (
        <Button
          key={deposit.id}
          className={`w-full justify-start ${selectedDeposit?.id === deposit.id ? 'bg-blue-100' : ''}`}
          onClick={() => onSelect(deposit)}
        >
          <div className="flex items-center">
            {getMineralIcon(deposit.name)}
            <span className="ml-2">{deposit.name} - {deposit.amount} units</span>
          </div>
        </Button>
      ))}
    </div>
  );
};