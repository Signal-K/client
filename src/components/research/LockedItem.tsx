import React from "react";
import { Button } from "@/src/components/ui/button";
import { Lock } from "lucide-react";

interface LockedItemProps {
  title: string;
  description: string;
};

export const LockedItem: React.FC<LockedItemProps> = ({ title, description }) => (
  <div className="bg-[#0a1929] border border-[#1e3a5f] p-4 rounded-md opacity-70">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-[#8badc9] mt-1 text-sm">{description}</p>
      </div>
      <Button
        variant="outline"
        className="border-[#1e3a5f] text-[#8badc9] bg-[#0f2942]"
        disabled
      >
        <Lock className="mr-2 w-4 h-4" />
        LOCKED
      </Button>
    </div>
  </div>
);