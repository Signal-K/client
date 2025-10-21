import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface for user upgrade data
 */
export interface UserUpgrades {
  telescopeUpgrade: boolean;
  telescopeReceptors: number;
  satelliteCount: number;
  roverLevel: number;
  roverWaypoints: number;
  findMinerals: boolean;
  p4FindMinerals: boolean;
  spectroscopy: boolean;
}

/**
 * Fetches all user upgrade data from the researched table
 * @param supabase - Supabase client instance
 * @param userId - User ID to fetch upgrades for
 * @returns UserUpgrades object with all upgrade information
 */
export async function fetchUserUpgrades(
  supabase: SupabaseClient,
  userId: string
): Promise<UserUpgrades> {
  try {
    const { data, error } = await supabase
      .from("researched")
      .select("tech_type, tech_id, created_at")
      .eq("user_id", userId);

    if (error || !data) {
      console.error("Error fetching user upgrades:", error);
      return getDefaultUpgrades();
    }

    // Derive values from researched rows
    let hasTelescopeUpgrade = false;
    let satelliteExtras = 0; // extra increments beyond the base 1
    let hasFindMinerals = false;
    let hasP4FindMinerals = false;
    let hasSpectroscopy = false;
    let derivedRoverLevel = 1;
    let roverWaypointUpgrades = 0;
    let telescopeReceptorUpgrades = 0;

    (data as any[]).forEach((row) => {
      const t = (row.tech_type || "").toString().toLowerCase();

      if (t.includes("probereceptor") || t.includes("probereceptors")) {
        hasTelescopeUpgrade = true;
        telescopeReceptorUpgrades += 1;
      }

      if (t.includes("satellite")) {
        // Each matching researched row increments available satellites by 1
        satelliteExtras += 1;
      }

      if (t.includes("findmineral") || t.includes("findminerals")) {
        hasFindMinerals = true;
      }

      if (t.includes("p4mineral") || t.includes("p4minerals")) {
        hasP4FindMinerals = true;
      }

      if (t.includes("spectroscopy")) {
        hasSpectroscopy = true;
      }

      if (t.includes("roverwaypoint") || t.includes("roverwaypoints")) {
        // rover waypoint research unlocks level 2 rover capabilities
        derivedRoverLevel = Math.max(derivedRoverLevel, 2);
        roverWaypointUpgrades += 1;
      }
    });

    return {
      telescopeUpgrade: hasTelescopeUpgrade,
      telescopeReceptors: 1 + telescopeReceptorUpgrades,
      satelliteCount: 1 + satelliteExtras,
      roverLevel: derivedRoverLevel,
      roverWaypoints: 4 + (roverWaypointUpgrades * 2),
      findMinerals: hasFindMinerals,
      p4FindMinerals: hasP4FindMinerals,
      spectroscopy: hasSpectroscopy,
    };
  } catch (error) {
    console.error('Error in fetchUserUpgrades:', error);
    return getDefaultUpgrades();
  }
}

/**
 * Get satellite count for a user
 * @param supabase - Supabase client instance
 * @param userId - User ID to fetch satellite count for
 * @returns Number of satellites available (1 base + upgrades)
 */
export async function getSatelliteCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("researched")
      .select("tech_type")
      .eq("user_id", userId)
      .ilike("tech_type", "%satellite%");

    if (error) {
      console.error("Error fetching satellite count:", error);
      return 1; // Default to 1 satellite
    }

    // Count all satellite upgrades
    const satelliteUpgrades = data?.length || 0;
    return 1 + satelliteUpgrades;
  } catch (error) {
    console.error('Error in getSatelliteCount:', error);
    return 1; // Default to 1 satellite
  }
}

/**
 * Check if user has a specific upgrade
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @param techType - Technology type to check for (e.g., "satellitecount", "probereceptors")
 * @returns Boolean indicating if the upgrade exists
 */
export async function hasUpgrade(
  supabase: SupabaseClient,
  userId: string,
  techType: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("researched")
      .select("tech_type")
      .eq("user_id", userId)
      .eq("tech_type", techType)
      .limit(1);

    if (error) {
      console.error(`Error checking for ${techType} upgrade:`, error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error(`Error in hasUpgrade for ${techType}:`, error);
    return false;
  }
}

/**
 * Returns default upgrade values
 */
function getDefaultUpgrades(): UserUpgrades {
  return {
    telescopeUpgrade: false,
    telescopeReceptors: 1,
    satelliteCount: 1,
    roverLevel: 1,
    roverWaypoints: 4,
    findMinerals: false,
    p4FindMinerals: false,
    spectroscopy: false,
  };
}
