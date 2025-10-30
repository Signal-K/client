"use client";

import React from "react";
import { AllUpgradesProgress } from "@/src/types/achievement";
import { Progress } from "@/src/components/ui/progress";
import { Check, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface AllUpgradesWidgetProps {
  data: AllUpgradesProgress;
}

export default function AllUpgradesWidget({ data }: AllUpgradesWidgetProps) {
  const router = useRouter();

  const progressPercent = (data.unlocked / data.total) * 100;

  return (
    <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Research Upgrades</h4>
        <button
          onClick={() => router.push("/research")}
          className="text-xs text-[#5fcbc3] hover:text-[#5fcbc3]/80 flex items-center gap-1"
        >
          Go to Research <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="grid grid-cols-2 gap-2">
        {data.upgrades.map((upgrade: any) => (
          <div
            key={upgrade.techType}
            className={`flex items-center gap-2 p-2 rounded text-xs ${
              upgrade.isUnlocked
                ? "bg-[#5fcbc3]/10 text-[#5fcbc3]"
                : "bg-[#2c4f64]/20 text-gray-400"
            }`}
          >
            {upgrade.isUnlocked ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 flex-shrink-0 opacity-50" />
            )}
            <span className="truncate">{upgrade.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
