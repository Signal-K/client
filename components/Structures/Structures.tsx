"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryStructureItem, StructureItemDetail } from "@/types/Items";
import IndividualStructure, { IndividualStructureProps } from "./IndividualStructure";
// import { StructuresConfig } from "@/constants/Structures/Properties";

import "../../styles/Anims/StarterStructureAnimations.css";

import { UnownedSurfaceStructures } from "./Build/EditMode";
import { useRouter } from "next/navigation";

interface Props {
  author?: string;
};

export default function Structures() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const { activePlanet } = useActivePlanet();

  const [loading, setLoading] = useState(true);
  const [structureGroups, setStructureGroups] = useState<{
    Orbital: InventoryStructureItem[],
    Atmosphere: InventoryStructureItem[],
    Surface: InventoryStructureItem[],
  }>({ Orbital: [], Atmosphere: [], Surface: [] });

  const [itemDetails, setItemDetails] = useState<Map<number, StructureItemDetail>>(new Map());

  const fetchStructures = useCallback(async () => {
    if (!session || !activePlanet) {
      setLoading(false);
      return;
    };

    try {
      const response = await fetch('/api/gameplay/inventory');
      const itemsData: StructureItemDetail[] = await response.json();

      const itemMap = new Map<number, StructureItemDetail>();
      itemsData.forEach(item => {
        if (item.ItemCategory === 'Structure') {
          itemMap.set(item.id, item);
        }
      });
      setItemDetails(itemMap);

      const { data: inventoryData, error } = await supabase
        .from("inventory")
        .select("*")
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id);

      if (error) throw error;

      const groups = {
        Orbital: [] as InventoryStructureItem[],
        Atmosphere: [] as InventoryStructureItem[],
        Surface: [] as InventoryStructureItem[],
      };

      const uniqueStructureMap = new Map<number, InventoryStructureItem>();

      for (const structure of inventoryData) {
        const itemDetail = itemMap.get(structure.item);
        if (itemDetail && !uniqueStructureMap.has(structure.item)) {
          uniqueStructureMap.set(structure.item, structure);
          const location = itemDetail.locationType || 'Surface';
          if (location in groups) {
            groups[location as keyof typeof groups].push(structure);
          };
        };
      };

      setStructureGroups(groups);
    } catch (err) {
      console.error("Error fetching structures:", err);
    } finally {
      setLoading(false);
    }
  }, [session, supabase, activePlanet]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleIconClick = (itemId: number) => {
    const routes: Record<number, string> = {
      3103: "telescope",
      3104: "greenhouse",
      3105: "balloon"
    };

    const route = routes[itemId];
    if (route) {
      router.push(`/structures/${route}`);
    };
  };

  const renderStructureGroup = (label: string, structures: InventoryStructureItem[]) => {
    if (!structures.length) return null;

    return (
      <div className="mb-6">
        <h3 className="text-center text-lg font-semibold text-blue-800 mb-3">{label}</h3>
        <div className="grid px-11 grid-cols-4 gap-1 gap-y-3">
          {structures.map(structure => {
            const itemDetail = itemDetails.get(structure.item);
            if (!itemDetail) return null;

            return (
              <div key={structure.id} className="flex flex-col items-center space-y-2">
                <img
                  src={itemDetail.icon_url}
                  alt={itemDetail.name}
                  className="w-24 h-24 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => handleIconClick(itemDetail.id)}
                />
                <p className="text-xs text-center text-gray-700">{itemDetail.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading structures...</p>
      ) : (
        <>
          {renderStructureGroup("", structureGroups.Orbital)}
          {renderStructureGroup("", structureGroups.Atmosphere)}
          {renderStructureGroup("", structureGroups.Surface)}
        </>
      )}
    </div>
  );
};