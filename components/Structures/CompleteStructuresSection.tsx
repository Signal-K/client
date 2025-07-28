"use client";

import { Telescope } from "lucide-react";
import TelescopeBlock from "./Equipment/TelescopeBlock";
import SatelliteBlock from "./Equipment/SatelliteBlock";
import FutureStructures from "./Equipment/FutureStructures";

interface CompleteStructuresSectionProps {
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

export default function CompleteStructuresSection({
  planetTargets,
  activeSatelliteMessage,
  visibleStructures,
  onSendSatellite,
  onCheckActiveSatellite,
}: CompleteStructuresSectionProps) {
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
        {/* Telescope Block */}
        <TelescopeBlock visible={visibleStructures.telescope} />

        {/* Satellite Block */}
        <SatelliteBlock
          visible={visibleStructures.satellites}
          planetTargets={planetTargets}
          activeSatelliteMessage={activeSatelliteMessage}
          onSendSatellite={onSendSatellite}
          onCheckActiveSatellite={onCheckActiveSatellite}
        />

        {/* Future Structures */}
        <FutureStructures
          visibleStructures={{
            rovers: visibleStructures.rovers,
            balloons: visibleStructures.balloons,
          }}
        />
      </div>
    </section>
  );
}
