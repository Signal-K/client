"use client";

import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Plus, Minus, Hammer, GemIcon } from "lucide-react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActivePlanet } from "@/context/ActivePlanet";

interface StructureRepairProps {
  inventoryId: number;
  onSave?: () => void;
}

const StructureRepair: React.FC<StructureRepairProps> = ({
  onSave,
  inventoryId,
}) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [structureDurability, setStructureDurability] = useState<number>(0);
  const [structureName, setStructureName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [baseDurability, setBaseDurability] = useState<number>(0); 
  const [potentialDurability, setPotentialDurability] = useState<number>(0);
  const [ironToAdd, setIronToAdd] = useState<number>(0);useState
  const [ironStock, setIronStock] = useState<number>(0);

  useEffect(() => {
    setPotentialDurability(baseDurability + ironToAdd); 
  }, [baseDurability, ironToAdd]);

  useEffect(() => {
    const fetchStructureData = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("configuration, item")
          .eq("item", inventoryId)
          .eq("owner", session?.user?.id)
          .eq("anomaly", activePlanet?.id)
          .order("id", { ascending: true })
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          const config = data.configuration as { Uses?: number };
          const durability = config.Uses ?? 0; 
          setBaseDurability(durability); 
          setStructureDurability(durability);

          const itemId = data.item;
          const response = await fetch("/api/gameplay/inventory");
          const inventoryItems = await response.json();

          const item = inventoryItems.find(
            (item: { id: number }) => item.id === itemId
          );

          if (item) {
            setStructureName(item.name); 
          } else {
            setStructureName("Unknown Structure");
          }
        }

        // Fetch total iron stock
        const { data: ironData, error: ironError } = await supabase
          .from("inventory")
          .select("quantity")
          .eq("item", 15)  // 15 is the iron item ID
          .eq("owner", session?.user?.id)
          .eq("anomaly", activePlanet?.id);

        if (ironError) throw ironError;

        const totalIron = ironData.reduce(
          (sum: number, row: { quantity: number }) => sum + row.quantity,
          0
        );
        setIronStock(totalIron); 

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStructureData();
  }, [supabase, session, activePlanet, inventoryId]);

  const repairStructure = async () => {
    try {
      // Update the structure's durability
      const newDurability = baseDurability + ironToAdd;
      await supabase
        .from("inventory")
        .update({ configuration: { Uses: newDurability } })
        .eq("item", inventoryId)
        .eq("owner", session?.user?.id)
        .eq("anomaly", activePlanet?.id);

      // Reduce the iron stock
      const remainingIron = ironStock - ironToAdd;
      await supabase
        .from("inventory")
        .delete()
        .eq("item", 15)
        .eq("owner", session?.user?.id)
        .eq("anomaly", activePlanet?.id);

      if (remainingIron > 0) {
        await supabase
          .from("inventory")
          .insert({
            item: 15,
            owner: session?.user?.id,
            anomaly: activePlanet?.id,
            quantity: remainingIron,
          });
      }

      setIronStock(remainingIron); 
      setBaseDurability(newDurability); 
      setIronToAdd(0); 

    } catch (err) {
      console.error("Error repairing structure:", err);
      setError("Failed to repair structure.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="w-96 text-[#F7F5E9]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#5FCBC3] rounded-full flex items-center justify-center">
              <Hammer className="w-10 h-10 text-[#2C4F64]" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {structureName} 
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-lg">Durability:</span>
            <div className="text-2xl font-bold">
              <span>{baseDurability}</span>
              {ironToAdd > 0 && (
                <span className="text-[#85DDA2]"> → {potentialDurability}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="ironToAdd" className="block text-sm font-medium">
              Iron to add:
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-[#5FCBC3] text-[#2C4F64] hover:bg-[#85DDA2]"
                onClick={() => setIronToAdd(Math.max(0, ironToAdd - 1))}
                disabled={ironToAdd === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Input
                  id="ironToAdd"
                  type="number"
                  value={ironToAdd}
                  readOnly
                  className="w-full text-center bg-[#F7F5E9] text-[#2C4F64] pr-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <GemIcon />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="bg-[#5FCBC3] text-[#2C4F64] hover:bg-[#85DDA2]"
                onClick={() => setIronToAdd(ironToAdd + 1)}
                disabled={ironToAdd >= ironStock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-[#FFD580] text-right">
              Iron stock: {ironStock}
            </div>
          </div>
          <Button
            className="w-full bg-[#FFD580] text-[#2C4F64] hover:bg-[#85DDA2]"
            onClick={repairStructure}
            disabled={ironToAdd === 0}
          >
            Repair Structure
          </Button>
            <Button 
              className="w-full bg-[#85DDA2] text-[#2C4F64] hover:bg-[#5FCBC3] flex items-center justify-center"
              onClick={() => window.open('https://example.com/game-guide', '_blank')}
            >
              Go to the automaton structure to mine iron
            </Button>
        </CardContent>
      </div>
    </div>
  );
};

export default StructureRepair;