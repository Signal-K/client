"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface MineralDepositCalloutProps {
  deposit: any;
}

export function MineralDepositCallout({ deposit }: MineralDepositCalloutProps) {
  if (!deposit) return null;

  return (
    <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 border border-amber-400 flex items-center gap-4">
      <div className="text-lg">🪨</div>
      <div className="flex-1 flex justify-between items-center text-xs">
        <div className="font-medium text-amber-700 dark:text-amber-300">
          Type:{" "}
          <span className="font-bold text-amber-900 dark:text-amber-100">
            {deposit.mineral_configuration?.type || 'Unknown'}
          </span>
        </div>
        <div className="font-medium text-amber-700 dark:text-amber-300">
          Purity:{" "}
          <span className="font-bold text-amber-900 dark:text-amber-100">
            {deposit.mineral_configuration?.purity 
              ? `${(deposit.mineral_configuration.purity * 100).toFixed(1)}%`
              : 'N/A'}
          </span>
        </div>
        <div className="font-medium text-amber-700 dark:text-amber-300">
          Amount:{" "}
          <span className="font-bold text-amber-900 dark:text-amber-100">
            {deposit.mineral_configuration?.amount 
              ? `${Math.round(deposit.mineral_configuration.amount)} units`
              : 'N/A'}
          </span>
        </div>
        <div className="font-medium text-amber-700 dark:text-amber-300">
          Source:{" "}
          <span className="font-bold text-amber-900 dark:text-amber-100">
            {deposit.mineral_configuration?.metadata?.source || 'Unknown'}
          </span>
        </div>
      </div>
      <Link href="/inventory">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium">
          Details
        </Button>
      </Link>
    </div>
  );
}
