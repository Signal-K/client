"use client";

import MilestoneCard from "@/src/components/deployment/missions/structures/Milestones/MilestonesNewUi";

export default function LegacyMilestonesSection() {
  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <h3 className="text-xl font-semibold text-primary mb-4">Current Milestones</h3>
      <MilestoneCard />
    </div>
  );
}
