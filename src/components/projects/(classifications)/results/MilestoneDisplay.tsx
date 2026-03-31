"use client";

import React from "react";
import { Progress } from "@/src/components/ui/progress";

interface Milestone {
  name: string;
  requiredCount: number;
  currentCount: number;
  achieved: boolean;
}

interface MilestoneDisplayProps {
  milestones: Milestone[] | null;
}

export function MilestoneDisplay({ milestones }: MilestoneDisplayProps) {
  return (
    <div className="space-y-3 pt-2">
      <h2 className="text-md font-semibold text-[#2E3440]">🎯 Milestones</h2>

      {milestones === null ? (
        <div className="text-sm text-[#4C566A]">Checking milestones...</div>
      ) : milestones.length === 0 ? (
        <div className="text-sm text-[#4C566A] italic">
          No related milestones for this classification type.
        </div>
      ) : (
        milestones.map((m) => (
          <div
            key={m.name}
            className={`rounded-lg p-3 border min-h-[96px] flex flex-col justify-between ${
              m.achieved
                ? "bg-[#FFF3CD] text-[#856404] border-[#FFECB5]"
                : "bg-[#E3F2FD] text-[#1565C0] border-[#90CAF9]"
            }`}
          >
            <div className="font-medium">{m.name}</div>
            <div className="pt-1">
              {m.achieved ? (
                <div className="font-bold text-sm">🎉 Milestone Achieved!</div>
              ) : (
                <>
                  <div className="text-xs mb-1">
                    {m.currentCount} / {m.requiredCount}
                  </div>
                  <Progress value={(m.currentCount / m.requiredCount) * 100} />
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
