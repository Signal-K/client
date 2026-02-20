import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Mineral deposit types and their configurations
 */
type MineralType = 
  | "water-ice" 
  | "co2-ice" 
  | "metallic-hydrogen" 
  | "metallic-helium" 
  | "methane" 
  | "ammonia"
  | "soil"
  | "dust"
  | "water-vapour";

interface MineralDepositConfig {
  type: MineralType;
  amount?: number;
  purity?: number;
  metadata?: Record<string, any>;
}

interface CreateMineralDepositParams {
  supabase: SupabaseClient;
  userId: string;
  anomalyId: number;
  classificationId: number;
  mineralConfig: MineralDepositConfig;
  location?: string;
}

/**
 * Check if user has unlocked mineral discovery research
 */
async function hasMineralResearch(
  supabase: SupabaseClient, 
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("id")
      .eq("owner", userId)
      .eq("item", 3103); // Mineral discovery structure item ID

    if (error) {
      console.error("[Mineral Research] Error checking research:", error);
      return false;
    }

    const hasResearch = !!data && data.length > 0;
    
    return hasResearch;
  } catch (error) {
    console.error("[Mineral Research] Exception checking research:", error);
    return false;
  }
}

/**
 * Check if planet (anomaly) has valid stats for mineral discovery
 * For cloud/atmospheric classifications, this checks the parent planet's stats
 */
async function isPlanetCompatible(
  supabase: SupabaseClient,
  userId: string,
  anomalyId: number,
  classificationId?: number
): Promise<boolean> {
  try {
    let planetAnomalyId = anomalyId;

    // If a classification ID is provided, check if it references a parent planet
    if (classificationId) {
      const { data: classification } = await supabase
        .from("classifications")
        .select("classificationConfiguration")
        .eq("id", classificationId)
        .single();

      if (classification?.classificationConfiguration) {
        let config;
        try {
          config = typeof classification.classificationConfiguration === 'string'
            ? JSON.parse(classification.classificationConfiguration)
            : classification.classificationConfiguration;
          
          // If this classification has a parentPlanet reference, use that
          if (config.parentPlanet) {
            
            
            // Get the parent planet classification to find its anomaly
            const { data: parentClassification } = await supabase
              .from("classifications")
              .select("anomaly")
              .eq("id", config.parentPlanet)
              .single();
            
            if (parentClassification) {
              planetAnomalyId = parentClassification.anomaly;
            }
          }
        } catch (e) {
          console.error("[Mineral Compatibility] Error parsing classification config:", e);
        }
      }
    }

    // Check if planet has a classification with stats (from satellite survey)
    const { data: classifications, error } = await supabase
      .from("classifications")
      .select("classificationConfiguration")
      .eq("author", userId)
      .eq("anomaly", planetAnomalyId);

    if (error) {
      console.error("[Mineral Compatibility] Error fetching classifications:", error);
      return false;
    }

    if (!classifications || classifications.length === 0) {
      return false;
    }

    // Check if any classification has planet stats (from satellite survey)
    for (const classification of classifications) {
      if (!classification.classificationConfiguration) continue;
      
      let config;
      try {
        config = typeof classification.classificationConfiguration === 'string'
          ? JSON.parse(classification.classificationConfiguration)
          : classification.classificationConfiguration;
      } catch (e) {
        continue;
      }

      // Check if has planet stats (mass, radius, temp from satellite survey)
        if (config.planet_mass !== undefined && 
          config.planet_mass !== "N/A" &&
          config.planet_radius !== undefined && 
          config.planet_radius !== "N/A") {
          return true;
        }
    }

    return false;
  } catch (error) {
    console.error("[Mineral Compatibility] Exception checking planet:", error);
    return false;
  }
}

/**
 * Roll for mineral deposit creation (1 in 3 chance)
 */
function rollForMineralDeposit(): boolean {
  return Math.random() < 1 / 3;
}

/**
 * Create a mineral deposit entry in the database
 */
async function createMineralDeposit({
  supabase: _supabase,
  userId,
  anomalyId,
  classificationId,
  mineralConfig,
  location
}: CreateMineralDepositParams): Promise<{ success: boolean; depositId?: number; error?: any }> {
  try {
    const response = await fetch("/api/gameplay/mineral-deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner: userId,
        anomaly: anomalyId,
        discovery: classificationId,
        mineralconfiguration: mineralConfig,
        location: typeof window !== "undefined" ? location || null : null,
        created_at: new Date().toISOString(),
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[Mineral Deposit] Error creating deposit:", result?.error);
      return { success: false, error: result?.error || "Failed to create mineral deposit" };
    }

    return { success: true, depositId: result?.id };
  } catch (error) {
    console.error("[Mineral Deposit] Exception creating deposit:", error);
    return { success: false, error };
  }
}

/**
 * Main function to attempt mineral deposit creation
 * Returns true if deposit was created, false otherwise
 */
export async function attemptMineralDepositCreation({
  supabase,
  userId,
  anomalyId,
  classificationId,
  mineralConfig,
  location
}: CreateMineralDepositParams): Promise<boolean> {
  // Check if user has mineral research
  const hasResearch = await hasMineralResearch(supabase, userId);
  if (!hasResearch) {
    
    return false;
  }

  // Check if planet is compatible (pass classificationId to check parent planet reference)
  const isCompatible = await isPlanetCompatible(supabase, userId, anomalyId, classificationId);
  if (!isCompatible) {
    
    return false;
  }

  // Roll for deposit creation (1 in 3 chance)
  if (!rollForMineralDeposit()) {
    
    return false;
  }

  // Create the deposit
  const result = await createMineralDeposit({
    supabase,
    userId,
    anomalyId,
    classificationId,
    mineralConfig,
    location
  });

  return result.success;
}

/**
 * Randomly select a mineral type for Cloud on Mars classifications
 */
export function selectCloudMineral(): MineralDepositConfig {
  const minerals: MineralType[] = ["water-ice", "co2-ice"];
  const selectedMineral = minerals[Math.floor(Math.random() * minerals.length)];
  
  return {
    type: selectedMineral,
    amount: Math.random() * 100 + 50, // 50-150 units
    purity: Math.random() * 0.3 + 0.7, // 70-100% purity
    metadata: {
      source: "cloud-classification",
      discoveryMethod: "spectral-analysis"
    }
  };
}

/**
 * Randomly select a mineral type for Jovian Vortex Hunter classifications
 * Based on Jupiter's atmospheric composition
 */
export function selectJovianMineral(): MineralDepositConfig {
  // Jupiter composition: ~90% H2, ~10% He, traces of methane and ammonia
  const roll = Math.random();
  let selectedMineral: MineralType;
  
  if (roll < 0.50) {
    selectedMineral = "metallic-hydrogen";
  } else if (roll < 0.75) {
    selectedMineral = "metallic-helium";
  } else if (roll < 0.90) {
    selectedMineral = "methane";
  } else {
    selectedMineral = "ammonia";
  }
  
  return {
    type: selectedMineral,
    amount: Math.random() * 500 + 100, // 100-600 units (gas giants have more)
    purity: Math.random() * 0.4 + 0.6, // 60-100% purity
    metadata: {
      source: "jovian-vortex-analysis",
      atmosphericPressure: Math.random() * 1000 + 500,
      depth: Math.random() * 10000 + 5000
    }
  };
}

/**
 * Select a mineral type for Planet Four classifications based on annotations
 */
export function selectPlanetFourMineral(annotations?: any[]): MineralDepositConfig {
  // Default minerals for Mars-like surfaces
  const minerals: MineralType[] = ["soil", "dust", "water-vapour"];
  
  // If annotations suggest specific features, bias towards certain minerals
  // For now, random selection with weighted probabilities
  const roll = Math.random();
  let selectedMineral: MineralType;
  
  if (roll < 0.40) {
    selectedMineral = "dust";
  } else if (roll < 0.70) {
    selectedMineral = "soil";
  } else {
    selectedMineral = "water-vapour";
  }
  
  return {
    type: selectedMineral,
    amount: Math.random() * 80 + 20, // 20-100 units
    purity: Math.random() * 0.5 + 0.5, // 50-100% purity
    metadata: {
      source: "surface-analysis",
      annotations: annotations || [],
      surfaceType: selectedMineral === "water-vapour" ? "polar" : "equatorial"
    }
  };
}
