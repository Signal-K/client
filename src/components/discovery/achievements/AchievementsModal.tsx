"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievements } from "../../../hooks/useAchievements";
import { CLASSIFICATION_LABELS, MilestoneTier, ClassificationType, ClassificationAchievement } from "../../../types/achievement";
import {
  Telescope,
  Cloud,
  Droplets,
  Sun,
  Mountain,
  Bird,
  Bot,
  Satellite,
  Wind,
  Target,
  Disc,
  Star,
  Radio,
  Activity,
  CloudRain,
  Rocket,
} from "lucide-react";

const CLASSIFICATION_ICONS: Record<string, React.ReactNode> = {
  DiskDetective: <Disc className="w-full h-full text-white" />,
  "automaton-aiForMars": <Bot className="w-full h-full text-white" />,
  "balloon-marsCloudShapes": <CloudRain className="w-full h-full text-white" />,
  cloud: <Cloud className="w-full h-full text-white" />,
  "lidar-jovianVortexHunter": <Wind className="w-full h-full text-white" />,
  planet: <Telescope className="w-full h-full text-white" />,
  "planet-inspection": <Target className="w-full h-full text-white" />,
  sunspot: <Sun className="w-full h-full text-white" />,
  "satellite-planetFour": <Satellite className="w-full h-full text-white" />,
};

interface AchievementDetail {
  type: "classification" | "mineral" | "planet";
  name: string;
  count: number;
  tier: number;
  description: string;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { achievements, loading, error } = useAchievements();
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementDetail | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBadgeClick = (detail: AchievementDetail) => {
    setSelectedAchievement(detail);
  };

  const closeDetailView = () => {
    setSelectedAchievement(null);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] bg-[#1e2a3a] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#2c4f64] to-[#1e2a3a] p-4 sm:p-6 border-b border-[#5fcbc3]/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                Achievements
              </h2>
              {achievements && (
                <p className="text-[#5fcbc3] text-xs sm:text-sm">
                  {achievements.totalUnlocked} / {achievements.totalAchievements}{" "}
                  Unlocked
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-[#5fcbc3] transition-colors p-2 rounded-full hover:bg-white/10 flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] sm:max-h-[calc(90vh-120px)] p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-white text-lg">Loading achievements...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-400 text-lg">Error: {error}</div>
            </div>
          )}

          {achievements && (
            <div className="space-y-8">
              {/* Classification Achievements */}
              <section>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-[#5fcbc3]/30">
                  Classification Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {(() => {
                    const badges = achievements.classifications
                      .map((achievement: ClassificationAchievement) => {
                        // Skip if no classifications of this type
                        if (achievement.count < 1) return null;

                        const label =
                          CLASSIFICATION_LABELS[achievement.classificationType as ClassificationType] ||
                          achievement.classificationType;
                        const icon =
                          CLASSIFICATION_ICONS[achievement.classificationType] || (
                            <Telescope className="w-full h-full text-white" />
                          );

                        // Find the highest unlocked milestone
                        const unlockedMilestones = achievement.milestones.filter((m: any) => m.isUnlocked);
                        const highestMilestone = unlockedMilestones.length > 0 
                          ? unlockedMilestones[unlockedMilestones.length - 1]
                          : null;

                        // Only render if there's an unlocked milestone
                        if (!highestMilestone) return null;

                        return (
                          <AchievementBadge
                            key={`${achievement.classificationType}-${highestMilestone.tier}`}
                            icon={icon}
                            count={achievement.count}
                            label={`${highestMilestone.tier}`}
                            isUnlocked={true}
                            milestone={highestMilestone.tier}
                            size="md"
                            onClick={() => handleBadgeClick({
                              type: "classification",
                              name: label,
                              count: achievement.count,
                              tier: highestMilestone.tier,
                              description: `You've completed ${achievement.count} ${label} classification${achievement.count !== 1 ? 's' : ''}. ${highestMilestone.tier === 25 ? "Maximum tier achieved!" : `Reach ${highestMilestone.tier === 1 ? 5 : highestMilestone.tier === 5 ? 10 : 25} to unlock the next tier.`}`
                            })}
                          />
                        );
                      })
                      .filter(Boolean);

                    if (badges.length === 0) {
                      return (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          No classification achievements unlocked yet. Start exploring!
                        </div>
                      );
                    }

                    return badges;
                  })()}
                </div>
              </section>

              {/* Mineral Deposit Achievements */}
              <section>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-[#5fcbc3]/30">
                  Mineral Deposit Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {(() => {
                    // Find the highest unlocked milestone
                    const unlockedMilestones = achievements.mineralDeposits.milestones.filter((m: any) => m.isUnlocked);
                    const highestMilestone = unlockedMilestones.length > 0 
                      ? unlockedMilestones[unlockedMilestones.length - 1]
                      : null;

                    // Only render if there's an unlocked milestone
                    if (!highestMilestone) {
                      return (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          No mineral deposit achievements unlocked yet. Start surveying planets!
                        </div>
                      );
                    }

                    return (
                      <AchievementBadge
                        key={`mineral-${highestMilestone.tier}`}
                        icon={<Droplets className="w-full h-full text-white" />}
                        count={achievements.mineralDeposits.count}
                        label={`${highestMilestone.tier}`}
                        isUnlocked={true}
                        milestone={highestMilestone.tier}
                        size="md"
                        onClick={() => handleBadgeClick({
                          type: "mineral",
                          name: "Mineral Hunter",
                          count: achievements.mineralDeposits.count,
                          tier: highestMilestone.tier,
                          description: `You've discovered ${achievements.mineralDeposits.count} mineral deposit${achievements.mineralDeposits.count !== 1 ? 's' : ''}. ${highestMilestone.tier === 25 ? "Maximum tier achieved!" : `Reach ${highestMilestone.tier === 1 ? 5 : highestMilestone.tier === 5 ? 10 : 25} to unlock the next tier.`}`
                        })}
                      />
                    );
                  })()}
                </div>
              </section>

              {/* Planet Completion Achievements */}
              <section>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 pb-2 border-b border-[#5fcbc3]/30">
                  Planet Completion Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {(() => {
                    // Find the highest unlocked milestone
                    const unlockedMilestones = achievements.planetCompletions.milestones.filter((m: any) => m.isUnlocked);
                    const highestMilestone = unlockedMilestones.length > 0 
                      ? unlockedMilestones[unlockedMilestones.length - 1]
                      : null;

                    // Only render if there's an unlocked milestone
                    if (!highestMilestone) {
                      return (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          No planet completion achievements unlocked yet. Complete your first planet!
                        </div>
                      );
                    }

                    return (
                      <AchievementBadge
                        key={`planet-${highestMilestone.tier}`}
                        icon={<Target className="w-full h-full text-white" />}
                        count={achievements.planetCompletions.count}
                        label={`${highestMilestone.tier}`}
                        isUnlocked={true}
                        milestone={highestMilestone.tier}
                        size="md"
                        onClick={() => handleBadgeClick({
                          type: "planet",
                          name: "Planet Master",
                          count: achievements.planetCompletions.count,
                          tier: highestMilestone.tier,
                          description: `You've fully completed ${achievements.planetCompletions.count} planet${achievements.planetCompletions.count !== 1 ? 's' : ''}. ${highestMilestone.tier === 25 ? "Maximum tier achieved!" : `Reach ${highestMilestone.tier === 1 ? 5 : highestMilestone.tier === 5 ? 10 : 25} to unlock the next tier.`}`
                        })}
                      />
                    );
                  })()}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div 
            className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeDetailView}
          >
            <div 
              className="bg-[#1e2a3a] rounded-lg p-4 sm:p-6 max-w-md w-full border-2 border-[#5fcbc3]/50 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedAchievement.name}
                </h3>
                <button
                  onClick={closeDetailView}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-[#5fcbc3]">
                    Tier {selectedAchievement.tier}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {selectedAchievement.count}
                  </div>
                </div>

                <div className="h-px bg-[#5fcbc3]/30" />

                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {selectedAchievement.description}
                </p>

                <div className="bg-[#2c4f64]/30 rounded p-3 space-y-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#5fcbc3]">Milestone Tiers:</h4>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
                    <div className={`p-1.5 sm:p-2 rounded ${selectedAchievement.tier >= 1 ? 'bg-[#cd7f32]/20 text-[#cd7f32]' : 'bg-gray-700/20 text-gray-500'}`}>
                      <div className="font-bold">1</div>
                      <div className="text-[10px]">Bronze</div>
                    </div>
                    <div className={`p-1.5 sm:p-2 rounded ${selectedAchievement.tier >= 5 ? 'bg-[#c0c0c0]/20 text-[#c0c0c0]' : 'bg-gray-700/20 text-gray-500'}`}>
                      <div className="font-bold">5</div>
                      <div className="text-[10px]">Silver</div>
                    </div>
                    <div className={`p-1.5 sm:p-2 rounded ${selectedAchievement.tier >= 10 ? 'bg-[#ffd700]/20 text-[#ffd700]' : 'bg-gray-700/20 text-gray-500'}`}>
                      <div className="font-bold">10</div>
                      <div className="text-[10px]">Gold</div>
                    </div>
                    <div className={`p-1.5 sm:p-2 rounded ${selectedAchievement.tier >= 25 ? 'bg-[#b9f2ff]/20 text-[#b9f2ff]' : 'bg-gray-700/20 text-gray-500'}`}>
                      <div className="font-bold">25</div>
                      <div className="text-[10px]">Platinum</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={closeDetailView}
                  className="w-full py-2 bg-[#5fcbc3]/20 hover:bg-[#5fcbc3]/30 text-[#5fcbc3] rounded transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};