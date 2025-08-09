"use client";

import Link from "next/link";
import { Telescope } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface StructuresEquipmentSectionProps {
  planetTargets: { id: number; name: string }[];
  activeSatelliteMessage: string | null;
  visibleStructures: {
    telescope: boolean;
    satellites: boolean;
    rovers: boolean;
    balloons: boolean;
  };
  onSendSatellite: (classificationId: number) => Promise<void>;
  onCheckActiveSatellite: () => Promise<void>;
}

export default function StructuresEquipmentSection({
  planetTargets,
  activeSatelliteMessage,
  visibleStructures,
  onSendSatellite,
  onCheckActiveSatellite,
}: StructuresEquipmentSectionProps) {
  return (
    <section className="rounded-2xl border bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Telescope className="text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Structures & Equipment</h3>
            <p className="text-sm text-muted-foreground">
              Deploy advanced equipment to enhance your research capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">🎯 Deployment Strategy Guide</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <div>
              <strong>Start with a Telescope:</strong> Enhances your ability to classify distant objects and unlocks the research skill tree
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <div>
              <strong>Deploy Satellites:</strong> Send them to planets you've discovered to find atmospheric phenomena
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <div>
              <strong>Check Progress:</strong> Monitor your research advancement and unlock new technologies
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Telescope Block - Enhanced */}
        {visibleStructures.telescope && (
          <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔭</span>
                  <p className="font-medium">Telescope Array</p>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Your most important tool! Enhances classification accuracy and unlocks the research skill tree.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    ✓ Better data quality
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    ✓ Unlocks research
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    ✓ Finds distant objects
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <Link
                  href="/activity/deploy"
                  className="text-sm font-medium rounded px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  Deploy Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Satellites Block - Enhanced */}
        {visibleStructures.satellites && (
          <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🛰️</span>
              <p className="font-medium text-foreground">Weather Satellites</p>
              {planetTargets.length === 0 && (
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                  Need planets first
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Send satellites to planets you've discovered to study their atmospheres and find cloud formations.
            </p>
            
            {planetTargets.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Prerequisites:</strong> You need to classify at least one planet before deploying satellites.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  💡 Tip: Complete a planet classification to unlock satellites!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-foreground font-medium">
                    Deploy satellite to planet:
                  </label>
                  <select
                    className="text-sm font-medium rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition"
                    defaultValue=""
                    onChange={async (e) => {
                      const selectedId = Number(e.target.value);
                      if (!isNaN(selectedId)) {
                        await onSendSatellite(selectedId);
                        await onCheckActiveSatellite();
                      }
                    }}
                  >
                    <option value="" disabled>
                      Select target planet
                    </option>
                    {planetTargets.map((planet) => (
                      <option key={planet.id} value={planet.id}>
                        {planet.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activeSatelliteMessage ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      🛰️ Satellite Active!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {activeSatelliteMessage}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      ✓ Discovers clouds
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      ✓ Atmospheric data
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                      ✓ Weekly missions
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Future Structures - Only show if any are visible */}
        {(visibleStructures.rovers || visibleStructures.balloons) && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <span className="text-xl">🚧</span>
              Coming Soon: Advanced Equipment
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {visibleStructures.rovers && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <div>
                      <p className="font-medium text-sm">Planetary Rovers</p>
                      <p className="text-xs text-muted-foreground">Explore surface geology and mineral compositions</p>
                    </div>
                  </div>
                </div>
              )}
              {visibleStructures.balloons && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎈</span>
                    <div>
                      <p className="font-medium text-sm">Atmospheric Balloons</p>
                      <p className="text-xs text-muted-foreground">Study weather patterns and atmospheric layers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
              Unlock these by advancing through the research tree and making more discoveries!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
