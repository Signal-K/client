"use client";

import React, { useEffect, useState } from "react";
import { Diamond } from "lucide-react";

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost?: number;
  icon_url: string;
  ItemCategory: string; 
}

export type MineralDeposit = {
  name: string;
  id: string;
  mineral: string; // mineral ID (possibly a string)
  quantity: number;
  availableAmount: number;
  level: number; 
  uses: string[];
  position: { x: number; y: number };
};

type Props = {
  deposits: MineralDeposit[];
  onSelect: (deposit: MineralDeposit) => void;
  selectedDeposit: MineralDeposit | null;
};

export function MineralDepositList({ deposits, onSelect, selectedDeposit }: Props) {
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

  // Helper function to get the icon and name based on mineralId
  const getMineralDetails = (mineralId: string) => {
    // Ensure we're comparing numbers
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
    // If inventory hasn't loaded yet, you can either return a loading state or prevent deposits rendering
    return <p>Loading mineral data...</p>;
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#2C4F64] mb-4">Mineral Deposits</h2>
      <div className="overflow-y-auto flex-grow pr-2">
        {deposits.map((deposit) => {
          const { icon, name } = getMineralDetails(deposit.mineral);

          return (
            <div
              key={deposit.id}
              className={`p-4 rounded-lg cursor-pointer mb-2 ${
                selectedDeposit?.id === deposit.id
                  ? "bg-[#85DDA2] text-white"
                  : "bg-[#F7F5E9] hover:bg-[#B9E678]"
              }`}
              onClick={() => onSelect(deposit)}
            >
              <div className="flex items-center space-x-2">
                {icon}
                <h3 className="font-bold text-[#303F51]">{name}</h3>
              </div>
              <p className="font-italic text-[#303F51]">Quantity: {deposit.quantity}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};