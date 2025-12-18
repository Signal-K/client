"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import {
  MilestoneProgress,
  ALL_RESEARCH_UPGRADES,
  CLASSIFICATION_ROUTES,
  ALL_MINERAL_TYPES,
  ClassificationType,
} from "../types/achievement";

export const useMilestones = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [milestones, setMilestones] = useState<MilestoneProgress | null>(null);
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
      if (!userId) {
        setLoading(false);
        return;
      }

      // 1. Fetch all research upgrades
      const { data: researchData, error: researchError } = await supabase
        .from("researched")
        .select("tech_type")
        .eq("user_id", userId);

      if (researchError) {
        console.error("Research query error:", researchError);
        throw researchError;
      }

      

      const unlockedUpgrades = new Set(researchData?.map((r: any) => r.tech_type) || []);
      
      const allUpgrades = {
        type: "all-upgrades" as const,
        total: ALL_RESEARCH_UPGRADES.length,
        unlocked: ALL_RESEARCH_UPGRADES.filter((u) => unlockedUpgrades.has(u.techType)).length,
        upgrades: ALL_RESEARCH_UPGRADES.map((upgrade) => ({
          name: upgrade.name,
          techType: upgrade.techType,
          isUnlocked: unlockedUpgrades.has(upgrade.techType),
        })),
      };

      // 2. Fetch classification diversity
      const validTypes = [
        "DiskDetective",
        "automaton-aiForMars",
        "balloon-marsCloudShapes",
        "cloud",
        "lidar-jovianVortexHunter",
        "planet",
        "planet-inspection",
        "sunspot",
        "satellite-planetFour",
      ] as ClassificationType[];

      const { data: classificationData, error: classError } = await supabase
        .from("classifications")
        .select("classificationtype")
        .eq("author", userId);

      if (classError) throw classError;

      const classificationCounts: Record<string, number> = {};
      classificationData?.forEach((c: any) => {
        const type = c.classificationtype;
        if (validTypes.includes(type as ClassificationType)) {
          classificationCounts[type] = (classificationCounts[type] || 0) + 1;
        }
      });

      const classificationDiversity = {
        type: "classification-diversity" as const,
        total: validTypes.length,
        completed: validTypes.filter((type) => (classificationCounts[type] || 0) > 0).length,
        classifications: validTypes.map((type) => {
          const routeInfo = CLASSIFICATION_ROUTES[type];
          return {
            type,
            name: type,
            count: classificationCounts[type] || 0,
            isComplete: (classificationCounts[type] || 0) > 0,
            route: routeInfo.route,
            hint: routeInfo.hint,
          };
        }),
      };

      // 3. Fetch resource extraction (unique mineral types extracted)
      const { data: mineralsData, error: mineralsError } = await supabase
        .from("mineralDeposits")
        .select("mineralconfiguration")
        .eq("owner", userId);

      if (mineralsError) throw mineralsError;

      const extractedTypes = new Set<string>();
      mineralsData?.forEach((deposit: any) => {
        const config = deposit.mineralconfiguration;
        if (!config) return;
        
        const type = config.type || config.mineralType;
        if (type) {
          // Normalize the type name
          const normalizedType = ALL_MINERAL_TYPES.find(
            (mt) => mt.toLowerCase().replace(/[^a-z0-9]/g, "") === 
                    String(type).toLowerCase().replace(/[^a-z0-9]/g, "")
          );
          if (normalizedType) {
            extractedTypes.add(normalizedType);
          }
        }
      });

      const resourceExtraction = {
        type: "resource-extraction" as const,
        total: ALL_MINERAL_TYPES.length,
        extracted: extractedTypes.size,
        resources: ALL_MINERAL_TYPES.map((type) => ({
          type,
          name: type,
          isExtracted: extractedTypes.has(type),
        })),
      };

      setMilestones({
        allUpgrades,
        classificationDiversity,
        resourceExtraction,
      });
      
      
    } catch (err: any) {
      console.error("Error fetching milestones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    milestones,
    loading,
    error,
    refetch: fetchAchievements,
  };
};
