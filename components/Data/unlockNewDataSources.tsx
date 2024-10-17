"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Unlock } from "lucide-react";
import { lidarDataSources, telescopeDataSources, zoodexDataSources, roverDataSources } from "./ZoodexDataSources";
import { StructureInfo } from "../Structures/structureInfo";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { InventoryIdFetcher } from "../Inventory/fetchId";
import Link from "next/link";

export function DataSourcesModal({ structureId, structure }: DataSourcesModalProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
   
  const { activePlanet } = useActivePlanet();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries([
      ...zoodexDataSources,
      ...telescopeDataSources,
      ...lidarDataSources,
      ...roverDataSources, // Add rover data to the categories
    ].map((category) => [category.category, true]))
  ); 

  const [unlockedZoodexDataSources, setUnlockedZoodexDataSources] = useState<Record<string, boolean>>(
    Object.fromEntries(
      zoodexDataSources.flatMap((category) =>
        category.items.map((item: ZoodexItem) => [item.name, item.unlocked])
      ),
    ),
  );

  const [unlockedTelescopeDataSources, setUnlockedTelescopeDataSources] = useState<Record<string, boolean>>(
    Object.fromEntries(
      telescopeDataSources.flatMap((category) =>
        category.items.map((item: TelescopeItem) => [item.name, item.unlocked])
      ),
    )
  );

  const [unlockedLidarDataSources, setUnlockedLidarDataSources] = useState<Record<string, boolean>>(
    Object.fromEntries(
      lidarDataSources.flatMap((category) =>
        category.items.map((item: LidarItem) => [item.name, item.unlocked])
      ),
    )
  );

  const [unlockedRoverDataSources, setUnlockedRoverDataSources] = useState<Record<string, boolean>>(
    Object.fromEntries(
      roverDataSources.flatMap((category) =>
        category.items.map((item: RoverItem) => [item.name, item.unlocked])
      ),
    )
  );

  useEffect(() => {
    const fetchConfiguration = async () => {
      if (!session?.user?.id || !activePlanet?.id) return;
  
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("configuration")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", structureId)
          .single();
  
        if (error) throw error;
  
        const configuration = data?.configuration || {};
        const missionsUnlocked = configuration["missions unlocked"] || [];
  
        // For Zoodex
        setUnlockedZoodexDataSources(
          Object.fromEntries(
            zoodexDataSources.flatMap((category) =>
              category.items.map((item: ZoodexItem) => [item.name, missionsUnlocked.includes(item.identifier)])
            ),
          ),
        );
  
        // For Telescope
        setUnlockedTelescopeDataSources(
          Object.fromEntries(
            telescopeDataSources.flatMap((category) =>
              category.items.map((item: TelescopeItem) => [item.name, missionsUnlocked.includes(item.identifier)])
            ),
          ),
        );
  
        // For LIDAR
        setUnlockedLidarDataSources(
          Object.fromEntries(
            lidarDataSources.flatMap((category) =>
              category.items.map((item: LidarItem) => [item.name, missionsUnlocked.includes(item.identifier)])
            ),
          ),
        );
  
        // For Rover
        setUnlockedRoverDataSources(
          Object.fromEntries(
            roverDataSources.flatMap((category) =>
              category.items.map((item: RoverItem) => [item.name, missionsUnlocked.includes(item.identifier)])
            ),
          ),
        );
  
      } catch (err) {
        console.error("Error fetching configuration:", err);
      }
    };
  
    fetchConfiguration();
  }, [session, activePlanet, structureId, supabase]);  

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleFeature = async (featureName: string, dataSourceType: "Zoodex" | "Telescope" | "LIDAR" | "Rover") => {
    const dataSource = dataSourceType === "Zoodex"
      ? zoodexDataSources
      : dataSourceType === "Telescope"
      ? telescopeDataSources
      : dataSourceType === "LIDAR"
      ? lidarDataSources
      : roverDataSources; // Add rover logic

    const item = dataSource
      .flatMap(category => category.items)
      .find(item => item.name === featureName);

    if (!item) return;

    if (dataSourceType === "Telescope") {
      setUnlockedTelescopeDataSources(prev => ({
        ...prev,
        [featureName]: !prev[featureName],
      }));
    } else if (dataSourceType === "LIDAR") {
      setUnlockedLidarDataSources(prev => ({
        ...prev,
        [featureName]: !prev[featureName],
      }));
    } else if (dataSourceType === "Rover") {
      setUnlockedRoverDataSources(prev => ({
        ...prev,
        [featureName]: !prev[featureName],
      }));
    } else {
      setUnlockedZoodexDataSources(prev => ({
        ...prev,
        [featureName]: !prev[featureName],
      }));
    }

    if (session?.user?.id && activePlanet?.id) {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("id, configuration")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", structureId)
          .single();

        if (error) throw error;

        const newConfiguration: { "missions unlocked"?: string[] } = data?.configuration || {};

        if (!newConfiguration["missions unlocked"]) {
          newConfiguration["missions unlocked"] = [];
        }

        const missionsUnlocked = newConfiguration["missions unlocked"];
        if (!missionsUnlocked.includes(item.identifier)) {
          missionsUnlocked.push(item.identifier);
        }

        const { error: updateError } = await supabase
          .from("inventory")
          .update({ configuration: newConfiguration })
          .eq("id", data?.id);

        if (updateError) throw updateError;

        console.log("Updated configuration:", newConfiguration);
      } catch (err) {
        console.error("Error updating inventory configuration:", err);
      };
    };
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-96 bg-[#2C3A4A] rounded-lg shadow-xl">
        {/* <center>
          <StructureInfo structureName={structure} />
        </center> */}
        <div className="p-6 space-y-6">
          <InventoryIdFetcher
            structureId={structureId}
            onInventoryIdFetched={(id) => console.log("Fetched Inventory ID:", id)}
          />
          {structure === "Telescope" && telescopeDataSources.map((category) => (
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
                        (unlockedTelescopeDataSources[b.name] ? 1 : 0) -
                        (unlockedTelescopeDataSources[a.name] ? 1 : 0)
                    )
                    .map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2C4F64] transition-colors"
                      >
                        <div className="flex-grow">
                          <h3 className="font-medium text-[#D689E3]">{feature.name}</h3>
                          <p className="text-sm text-[#B9E678] opacity-80">{feature.description}</p>
                        </div>
                        {unlockedTelescopeDataSources[feature.name] ? (
                          <Unlock className="h-5 w-5 text-[#B9E678]" aria-label="Unlocked" />
                        ) : (
                          <button
                            onClick={() => toggleFeature(feature.name, "Telescope")}
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
                        (unlockedZoodexDataSources[b.name] ? 1 : 0) -
                        (unlockedZoodexDataSources[a.name] ? 1 : 0)
                    )
                    .map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2C4F64] transition-colors"
                      >
                        <div className="flex-grow">
                          <h3 className="font-medium text-[#D689E3]">{feature.name}</h3>
                          <p className="text-sm text-[#B9E678] opacity-80">{feature.description}</p>
                        </div>
                        {unlockedZoodexDataSources[feature.name] ? (
                          <Unlock className="h-5 w-5 text-[#B9E678]" aria-label="Unlocked" />
                        ) : (
                          <button
                            onClick={() => toggleFeature(feature.name, "Zoodex")}
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
          {structure === "Rover" && roverDataSources.map((category) => (
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
                        (unlockedRoverDataSources[b.name] ? 1 : 0) -
                        (unlockedRoverDataSources[a.name] ? 1 : 0)
                    )
                    .map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2C4F64] transition-colors"
                      >
                        <div className="flex-grow">
                          <h3 className="font-medium text-[#D689E3]">{feature.name}</h3>
                          <p className="text-sm text-[#B9E678] opacity-80">{feature.description}</p>
                        </div>
                        {unlockedRoverDataSources[feature.name] ? (
                          <Unlock className="h-5 w-5 text-[#B9E678]" aria-label="Unlocked" />
                        ) : (
                          <button
                            onClick={() => toggleFeature(feature.name, "Rover")}
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
                    {structure === "LIDAR" && roverDataSources.map((category) => (
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
                        (unlockedLidarDataSources[b.name] ? 1 : 0) -
                        (unlockedLidarDataSources[a.name] ? 1 : 0)
                    )
                    .map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-[#2C4F64] transition-colors"
                      >
                        <div className="flex-grow">
                          <h3 className="font-medium text-[#D689E3]">{feature.name}</h3>
                          <p className="text-sm text-[#B9E678] opacity-80">{feature.description}</p>
                        </div>
                        {unlockedLidarDataSources[feature.name] ? (
                          <Unlock className="h-5 w-5 text-[#B9E678]" aria-label="Unlocked" />
                        ) : (
                          <button
                            onClick={() => toggleFeature(feature.name, "Rover")}
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
        <center><Link href="/"><button
                            className="px-3 py-1 text-xs font-semibold text-[#2C3A4A] bg-[#FF695D] rounded-full hover:bg-[#D689E3] transition-colors duration-300"
                          >
                            Back to structure
                          </button></Link></center>
                          <div className="py-2"></div>
      </div>
    </div>
  );
};

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
  unlocked: boolean;
};

interface TelescopeItem {
  name: string;
  description: string;
  identifier: string;
  researchId: string;
  researcher: string;
  unlocked: boolean;
};

interface LidarItem {
  name: string;
  description: string;
  identifier: string;
  researchId: string;
  researcher: string;
  unlocked: boolean;
};

interface RoverItem {
  name: string;
  description: string;
  identifier: string;
  researchId: string;
  researcher: string;
  unlocked: boolean;
};