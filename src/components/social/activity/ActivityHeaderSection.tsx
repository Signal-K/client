"use client";

import ActivityHeader from "@/src/components/ui/scenes/deploy/ActivityHeader";

interface ActivityHeaderSectionProps {
  classificationsCount: number;
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
}

export default function ActivityHeaderSection({
  classificationsCount,
  landmarksExpanded,
  onToggleLandmarks,
}: ActivityHeaderSectionProps) {
  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Progress</p>
          <p className="text-lg font-semibold text-primary">
            {classificationsCount} discoveries made
          </p>
        </div>
      </div>
      <ActivityHeader
        scrolled={true}
        landmarksExpanded={landmarksExpanded}
        onToggleLandmarks={onToggleLandmarks}
      />
    </div>
  );
}
