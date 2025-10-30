"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import {
  AchievementProgress,
  ClassificationAchievement,
  ClassificationType,
  MILESTONE_TIERS,
  MilestoneTier,
} from "../types/achievement";

export const useAchievements = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [achievements, setAchievements] = useState<AchievementProgress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    fetchAchievements();
  }, [session?.user?.id]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = session?.user?.id;
      if (!userId) return;

      // Fetch all classification counts by type
      const { data: classificationData, error: classError } = await supabase
        .from("classifications")
        .select("classificationtype")
        .eq("author", userId);

      if (classError) throw classError;

      // Count classifications by type
      const classificationCounts: Record<string, number> = {};
      const validTypes = new Set([
        "DiskDetective",
        "automaton-aiForMars",
        "balloon-marsCloudShapes",
        "cloud",
        "lidar-jovianVortexHunter",
        "planet",
        "planet-inspection",
        "sunspot",
        "satellite-planetFour",
      ]);
      
      classificationData?.forEach((c) => {
        const type = c.classificationtype;
        // Only count valid classification types
        if (validTypes.has(type)) {
          classificationCounts[type] = (classificationCounts[type] || 0) + 1;
        }
      });

      // Build classification achievements
      const classificationAchievements: ClassificationAchievement[] =
        Object.entries(classificationCounts).map(([type, count]) => ({
          type: "classification" as const,
          classificationType: type as ClassificationType,
          count,
          milestones: MILESTONE_TIERS.map((tier: MilestoneTier) => ({
            tier,
            isUnlocked: count >= tier,
          })),
        }));

      // Fetch mineral deposit count
      const { count: mineralCount, error: mineralError } = await supabase
        .from("mineralDeposits")
        .select("*", { count: "exact", head: true })
        .eq("owner", userId);

      if (mineralError) throw mineralError;

      const mineralDeposits = {
        type: "mineral-deposit" as const,
        count: mineralCount || 0,
        milestones: MILESTONE_TIERS.map((tier: MilestoneTier) => ({
          tier,
          isUnlocked: (mineralCount || 0) >= tier,
        })),
      };

      // Fetch completed planets count (from PlanetCompletionWidget logic)
      const { data: planetsData, error: planetsError } = await supabase
        .from("classifications")
        .select(
          `
          id,
          anomaly,
          anomalies!inner(
            id,
            content,
            density,
            temperature,
            radius,
            mass,
            gravity
          )
        `
        )
        .eq("classificationtype", "planet")
        .eq("author", userId);

      if (planetsError) throw planetsError;

      // Count completed planets using same logic as PlanetCompletionWidget
      let completedPlanetsCount = 0;
      if (planetsData) {
        for (const classification of planetsData) {
          const anomalyData = classification.anomalies;
          const anomaly = Array.isArray(anomalyData)
            ? anomalyData[0]
            : anomalyData;

          if (!anomaly) continue;

          const anomalyId = anomaly.id;
          const density = anomaly.density;
          const temperature = anomaly.temperature;

          // Determine planet type
          let planetType: "Terrestrial" | "Gaseous" | "Habitable" | "Unsurveyed" = "Unsurveyed";
          let requiresWater = false;

          if (density !== null && density !== undefined) {
            if (density < 2.5) {
              planetType = "Gaseous";
            } else if (
              temperature !== null &&
              temperature !== undefined &&
              temperature >= -15 &&
              temperature <= 50
            ) {
              planetType = "Habitable";
              requiresWater = true;
            } else {
              planetType = "Terrestrial";
            }
          }

          // Check clouds
          const { data: cloudsData } = await supabase
            .from("classifications")
            .select("id")
            .eq("classificationtype", "cloud")
            .eq("anomaly", anomalyId)
            .limit(1);

          const hasClouds = (cloudsData?.length || 0) > 0;

          // Check mineral deposits
          const { data: depositsData } = await supabase
            .from("mineralDeposits")
            .select("id, mineralconfiguration")
            .eq("anomaly", anomalyId);

          const hasDeposits = (depositsData?.length || 0) > 0;

          // Check water
          let hasWater = false;
          if (requiresWater && depositsData) {
            hasWater = depositsData.some((deposit: any) => {
              const config = deposit.mineralconfiguration;
              if (!config) return false;
              const type = config.type?.toLowerCase() || "";
              return (
                type.includes("water") ||
                type.includes("ice") ||
                type.includes("h2o")
              );
            });
          }

          // Check completion
          const hasCloudsOrDeposits = hasClouds || hasDeposits;
          const hasDensity = planetType !== "Unsurveyed";
          const waterRequirementMet = !requiresWater || hasWater;

          if (hasCloudsOrDeposits && hasDensity && waterRequirementMet) {
            completedPlanetsCount++;
          }
        }
      }

      const planetCompletions = {
        type: "planet-completion" as const,
        count: completedPlanetsCount,
        milestones: MILESTONE_TIERS.map((tier: MilestoneTier) => ({
          tier,
          isUnlocked: completedPlanetsCount >= tier,
        })),
      };

      // Calculate totals
      const totalUnlocked =
        classificationAchievements.reduce(
          (sum, c) => sum + c.milestones.filter((m: any) => m.isUnlocked).length,
          0
        ) +
        mineralDeposits.milestones.filter((m: any) => m.isUnlocked).length +
        planetCompletions.milestones.filter((m: any) => m.isUnlocked).length;

      const totalAchievements =
        classificationAchievements.length * MILESTONE_TIERS.length +
        MILESTONE_TIERS.length * 2; // minerals + planet completions

      setAchievements({
        classifications: classificationAchievements,
        mineralDeposits,
        planetCompletions,
        totalUnlocked,
        totalAchievements,
      });
    } catch (err: any) {
      console.error("Error fetching achievements:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  };
};
