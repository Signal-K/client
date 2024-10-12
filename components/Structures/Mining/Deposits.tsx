"use client";

import React from "react";
import { Diamond } from "lucide-react";

export type MineralDeposit = {
    id: string;
    mineral: string; 
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
    const getIcon = (mineralId: string) => {
      switch (mineralId) {
        case "19":
          return <Diamond className="text-[#FFE3BA]" />;
        default:
          return <Diamond className="text-[#FFE3BA]" />;
      };
    };
  
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-bold text-[#2C4F64] mb-4">Mineral Deposits</h2>
        <div className="overflow-y-auto flex-grow pr-2">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className={`p-4 rounded-lg cursor-pointer mb-2 ${
                selectedDeposit?.id === deposit.id ? "bg-[#85DDA2] text-white" : "bg-[#F7F5E9] hover:bg-[#B9E678]"
              }`}
              onClick={() => onSelect(deposit)}
            >
              <div className="flex items-center space-x-2">
                {getIcon(deposit.mineral)}
                {/* <h3 className="font-bold text-[#303F51]">Mineral {deposit.mineral}</h3> */}
                <h3 className="font-bold text-[#303F51]">Fuel source</h3>
              </div>
              <p className="font-italic text-[#303F51]">Quantity: {deposit.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    );
};