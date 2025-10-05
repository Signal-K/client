"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ActivityHeader from "../../scenes/deploy/ActivityHeader";

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
  const session = useSession();
  const supabase = useSupabaseClient();
  const [upgradeStatus, setUpgradeStatus] = useState<{
    hasTelescopeUpgrade: boolean;
    hasSatelliteUpgrade: boolean;
    bothUpgradesUnlocked: boolean;
  }>({
    hasTelescopeUpgrade: false,
    hasSatelliteUpgrade: false,
    bothUpgradesUnlocked: false,
  });

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUpgradeStatus = async () => {
      const { data: researched } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", session.user.id);

      if (researched) {
        const hasTelescopeUpgrade = researched.some(r => r.tech_type === "probereceptors");
        const hasSatelliteUpgrade = researched.some(r => r.tech_type === "satellitecount");
        const bothUpgradesUnlocked = hasTelescopeUpgrade && hasSatelliteUpgrade;

        setUpgradeStatus({
          hasTelescopeUpgrade,
          hasSatelliteUpgrade,
          bothUpgradesUnlocked,
        });
      }
    };

    fetchUpgradeStatus();
  }, [session, supabase]);

  const getUpgradeMessage = () => {
    if (upgradeStatus.bothUpgradesUnlocked) {
      return {
        title: "All Upgrades Complete!",
        description: "Your telescope and satellite systems are fully enhanced. New projects are now available in the research lab.",
      };
    } else if (upgradeStatus.hasTelescopeUpgrade && !upgradeStatus.hasSatelliteUpgrade) {
      return {
        title: "Satellite Upgrade Available",
        description: "Add an additional satellite to your fleet for enhanced planetary coverage. Cost: 10 Stardust.",
      };
    } else if (!upgradeStatus.hasTelescopeUpgrade && upgradeStatus.hasSatelliteUpgrade) {
      return {
        title: "Telescope Upgrade Available",
        description: "Extend your telescope's receptors to increase anomaly detection per scan. Cost: 10 Stardust.",
      };
    } else {
      return {
        title: "Telescope Upgrade",
        description: "Increase anomalies per deployment by 2. Cost: 10 Stardust.",
      };
    }
  };

  const upgradeMessage = getUpgradeMessage();

  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <ActivityHeader
        scrolled={true}
        landmarksExpanded={landmarksExpanded}
        onToggleLandmarks={onToggleLandmarks}
      />
      <p className="text-lg pt-3">Welcome to Star Sailors</p>

      {/* Dynamic Upgrade Section */}
      <div className="mt-4 p-3 rounded-lg border bg-card">
        <h4 className="text-sm font-medium text-foreground">{upgradeMessage.title}</h4>
        <p className="text-xs text-muted-foreground">
          {upgradeMessage.description}
        </p>
      </div>
    </div>
  );
};
