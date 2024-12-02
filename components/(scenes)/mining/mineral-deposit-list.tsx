'use client';

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Diamond, Zap, Battery, Magnet, Crown, Gem } from 'lucide-react';
import { useSession } from "@supabase/auth-helpers-react";

export type MineralDeposit = {
  id: string;
  name: string;
  mineral: string;
  amount: number;
  position: { x: number; y: number };
  icon_url: string;
  level: number;
  uses: any[]; // Adjust this according to your actual data structure
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
  deposits: MineralDeposit[];
  onSelect: (deposit: MineralDeposit) => void;
  selectedDeposit: MineralDeposit | null;
};

const itemNames: Record<string, string> = {
  11: 'Coal',
  13: 'Silicon',
  15: 'Iron',
  16: 'Nickel',
  18: 'Fuel',
  19: 'Copper',
};

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
      }
    };

    fetchInventoryItems();
  }, []);

  const getMineralDetails = (deposit: MineralDeposit) => {
    // Map the mineral name using `deposit.mineral` or fallback to `deposit.name`
    const mineralName = deposit.mineral ? itemNames[deposit.mineral] || deposit.mineral : deposit.name || "Unknown Mineral";

    return {
      icon: getIcon(mineralName),
      name: mineralName,
    };
  };

  if (inventoryItems.length === 0) {
    return <p>Loading mineral data...</p>;
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[60vh]">
      <h3 className="text-lg font-semibold mb-2">Mineral Deposits</h3>
      {deposits.map((deposit) => {
        const { icon, name } = getMineralDetails(deposit);
        return (
          <Button
            key={deposit.id}
            className={`w-full justify-start ${selectedDeposit?.id === deposit.id ? 'bg-blue-100' : ''}`}
            onClick={() => onSelect(deposit)}
          >
            <div className="flex items-center">
              {icon}
              <span className="ml-2">{name} - {deposit.amount} units</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
};