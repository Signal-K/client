import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Interface for user upgrade data
 */
interface UserUpgrades {
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

      if (t.includes("probereceptor")) {
        hasTelescopeUpgrade = true;
        telescopeReceptorUpgrades += 1;
      }

      if (t.includes("satellite")) {
        // Each matching researched row increments available satellites by 1
        satelliteExtras += 1;
      }

      if (t.includes("findmineral")) {
        hasFindMinerals = true;
      }

      if (t.includes("p4mineral")) {
        hasP4FindMinerals = true;
      }

      if (t.includes("spectroscopy")) {
        hasSpectroscopy = true;
      }

      if (t.includes("roverwaypoint")) {
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
      // Silently return false if upgrade check fails
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
