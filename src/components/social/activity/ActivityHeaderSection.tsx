"use client";

import { useState } from "react";
import ActivityHeader from "../../scenes/deploy/ActivityHeader";
import { AchievementsModal } from "@/src/components/discovery/achievements/AchievementsModal";
import { Trophy } from "lucide-react";

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
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);

  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      {/* Achievements Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowAchievementsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5fcbc3] to-[#2c4f64] text-white rounded-lg hover:from-[#4fb3a3] hover:to-[#1e3a4a] transition-all shadow-lg hover:shadow-xl"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-medium">Achievements</span>
        </button>
      </div>

      <ActivityHeader
        scrolled={true}
        landmarksExpanded={landmarksExpanded}
        onToggleLandmarks={onToggleLandmarks}
      />
      <p className="text-lg pt-3">Welcome to Star Sailors</p>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
};
