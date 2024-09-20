"use client";

import { ForwardRefExoticComponent, useState } from "react";
import { ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react";
import { zoodexDataSources } from "./ZoodexDataSources";
import { StructureInfo } from "../structureInfo";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { InventoryIdFetcher } from "../fetchId";

interface DataSourcesModalProps {
  structureId: string;
  structure: string;
};

interface ZoodexItem {
  name: string;
  description: string;
  identifier: string;
  researchId: string;
  researcher: string;
  // icon: React.ReactElement | FC<BurrowingOwlIconProps> | ForwardRefExoticComponent<any>;
  unlocked: boolean;
};

interface BurrowingOwlIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
};

export function DataSourcesModal({ structureId, structure }: DataSourcesModalProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(zoodexDataSources.map((category) => [category.category, true]))
  );
  const [unlockedzoodexDataSources, setUnlockedzoodexDataSources] = useState<Record<string, boolean>>(
    Object.fromEntries(
      zoodexDataSources.flatMap((category) =>
        category.items.map((item) => [item.name, item.unlocked])
      ),
    ),
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleFeature = async (featureName: string) => {
    const item = zoodexDataSources
      .flatMap(category => category.items)
      .find(item => item.name === featureName) as ZoodexItem | undefined;
  
    if (!item) return; // Ensure item exists
  
    setUnlockedzoodexDataSources(prev => ({
      ...prev,
      [featureName]: !prev[featureName],
    }));
  
    if (session?.user?.id && activePlanet?.id) {
      try {
        // Fetch the inventory item
        const { data, error } = await supabase
          .from("inventory")
          .select("id, configuration")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", structureId)
          .single();
  
        if (error) throw error;
  
        // Ensure configuration is properly parsed as an object (it could be null)
        const newConfiguration: { "missions unlocked"?: string[] } = data?.configuration || {};
  
        // Initialize "missions unlocked" array if not present
        if (!newConfiguration["missions unlocked"]) {
          newConfiguration["missions unlocked"] = [];
        }
  
        // Update only if the item is not already unlocked
        const missionsUnlocked = newConfiguration["missions unlocked"];
        if (!missionsUnlocked.includes(item.identifier)) {
          missionsUnlocked.push(item.identifier); // Add the new mission
  
          // Perform the update to the `inventory` table with the new configuration
          const { error: updateError } = await supabase
            .from("inventory")
            .update({ configuration: newConfiguration })
            .eq("id", data.id);
  
          if (updateError) throw updateError;
        }
      } catch (err) {
        console.error("Error updating inventory:", err);
      }
    }
  };  

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#2C4457]">
      <div className="w-full max-w-md bg-[#2C3A4A] rounded-lg shadow-xl overflow-hidden">
        <center>
          <StructureInfo structureName={structure} />
        </center>
        <div className="p-6 space-y-6">
          <InventoryIdFetcher
            structureId={structureId}
            onInventoryIdFetched={(id) => console.log("Fetched Inventory ID:", id)}
          />
          {structure === "Zoodex" && zoodexDataSources.map((category) => (
            <div key={category.category} className="space-y-2">
              <button
                className="flex w-full items-center justify-between text-[#FF695D] hover:text-[#B9E678] transition-colors"
                onClick={() => toggleCategory(category.category)}
              >
                <h2 className="text-lg font-semibold">{category.category}</h2>
                {expandedCategories[category.category] ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              {expandedCategories[category.category] && (
                <ul className="space-y-2">
                  {category.items
                    .sort(
                      (a, b) =>
                        (unlockedzoodexDataSources[b.name] ? 1 : 0) -
                        (unlockedzoodexDataSources[a.name] ? 1 : 0)
                    )
                    .map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2C4F64] transition-colors"
                      >
                        {/* <span className="text-2xl" aria-hidden="true">
                          {feature.icon}
                        </span> */}
                        <div className="flex-grow">
                          <h3 className="font-medium text-[#D689E3]">{feature.name}</h3>
                          <p className="text-sm text-[#B9E678] opacity-80">{feature.description}</p>
                        </div>
                        {unlockedzoodexDataSources[feature.name] ? (
                          <Unlock className="h-5 w-5 text-[#B9E678]" aria-label="Unlocked" />
                        ) : (
                          <button
                            onClick={() => toggleFeature(feature.name)}
                            className="px-3 py-1 text-xs font-semibold text-[#2C3A4A] bg-[#FF695D] rounded-full hover:bg-[#D689E3] transition-colors duration-300"
                            aria-label={`Unlock ${feature.name}`}
                          >
                            Unlock
                          </button>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};