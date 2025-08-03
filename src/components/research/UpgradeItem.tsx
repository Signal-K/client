import React from "react";
import { Button } from "@/src/components/ui/button";
import { ArrowRight } from "lucide-react";

interface UpgradeItemProps {
  title: string;
  description: string;
  current: number;
  max: number;
  cost: number | string;
  onUpgrade: () => void;
  color: string;
  disabled?: boolean;
}

export const UpgradeItem: React.FC<UpgradeItemProps> = ({
  title,
  description,
  current,
  max,
  cost,
  onUpgrade,
  color,
  disabled = false,
}) => (
  <div className="bg-transparent border border-[#1e3a5f] p-4 rounded-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-[#8badc9] mt-1 text-sm">{description}</p>
        {current !== undefined && (
          <p className="text-xs text-[#4cc9f0] mt-2">
            Current: {current}/{max}
          </p>
        )}
      </div>
      <Button
        onClick={onUpgrade}
        disabled={disabled}
        className="text-white border-[#1e3a5f]"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}80`, // 50% opacity glow
        }}
      >
        {current < max ? (
          <>
            UPGRADE <ArrowRight className="ml-2 w-4 h-4" />
            <span className="ml-2 bg-transparent px-2 py-1 rounded text-sm text-[#f72585]">
              {cost}
            </span>
          </>
        ) : (
          "MAXED"
        )}
      </Button>
    </div>
  </div>
);