import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { motion } from "framer-motion";

type LaunchpadInfo = {
  [x: string]: any;
  id: number;
  quantity: number;
  fuelCapacity: number;
};

type FuelInfo = {
  id: number;
  quantity: number;
};

export default function LaunchpadStatus() {
  const [launchpad, setLaunchpad] = useState<LaunchpadInfo | null>(null);
  const [fuelAvailable, setFuelAvailable] = useState<number>(0);
  const [isAddingFuel, setIsAddingFuel] = useState<boolean>(false);
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    const fetchLaunchpad = async () => {
      if (!session?.user.id || !activePlanet?.id) return;

      const { data, error } = await supabase
        .from("inventory")
        .select("id, quantity, configuration")
        .eq("item", 3107) // Launchpad item ID
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id)
        .gte("quantity", 1)
        .single();

      if (error) {
        console.error("Error fetching launchpad:", error.message);
        return;
      }

      if (data) {
        const fuelCapacity = data.configuration?.fuel ?? 0;
        setLaunchpad({
          id: data.id,
          quantity: data.quantity,
          fuelCapacity,
        });
      }
    };

    const fetchFuel = async () => {
      if (!session?.user.id || !activePlanet?.id) return;

      const { data, error } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("item", 19) // Fuel item ID
        .eq("owner", session.user.id)
        // .eq("anomaly", activePlanet.id)
        .gt("quantity", 0);

      if (error) {
        console.error("Error fetching fuel:", error.message);
        return;
      }

      const totalFuel = data?.reduce((total: number, fuelItem: FuelInfo) => total + fuelItem.quantity, 0) || 0;
      setFuelAvailable(totalFuel);
    };

    fetchLaunchpad();
    fetchFuel();
  }, [session, activePlanet, supabase]);

  const [hasMission200000014, setHasMission200000014] = useState<boolean>(false);

  useEffect(() => {
    const checkMission = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user", session.user.id)
        .eq("mission", 200000014)
        .single();

      if (error) {
        console.error("Error fetching mission 200000014:", error);
        return;
      };

      setHasMission200000014(!!data);
    };

    checkMission();
  }, [session]);

  const handleAddFuel = async () => {
    if (!launchpad || fuelAvailable <= 0) return;

    setIsAddingFuel(true);

    // Define how much fuel to add (for example, 10 units)
    const fuelToAdd = Math.min(10, fuelAvailable);
    const missionData = {
      user: session?.user?.id,
      time_of_completion: new Date().toISOString(),
      mission: 200000014,
    };

    if (!hasMission200000014) {
      const { error: updateMissionError } = await supabase
        .from("missions")
        .insert([missionData]);

    if (updateMissionError) {
      console.error("Error updating mission 200000013: ", updateMissionError);
    };
  };

    try {
      // Update the launchpad fuel capacity
      const updatedFuelCapacity = launchpad.fuelCapacity + fuelToAdd;

      const { error: updateError } = await supabase
        .from("inventory")
        .update({
          configuration: {
            ...launchpad.configuration,
            fuel: updatedFuelCapacity,
          },
        })
        .eq("id", launchpad.id);

      if (updateError) {
        console.error("Error adding fuel to launchpad:", updateError.message);
        return;
      }

      // Reduce the quantity of fuel in the user's inventory
      const { data: fuelRows, error: fuelError } = await supabase
        .from("inventory")
        .select("id, quantity")
        .eq("item", 19)
        .eq("owner", session?.user.id)
        // .eq("anomaly", activePlanet.id)
        .gt("quantity", 0);

      if (fuelError) {
        console.error("Error fetching user's fuel for subtraction:", fuelError.message);
        return;
      };

      let remainingFuelToSubtract = fuelToAdd;
      for (const fuelRow of fuelRows) {
        if (remainingFuelToSubtract <= 0) break;

        const { id, quantity } = fuelRow;
        const fuelToSubtract = Math.min(quantity, remainingFuelToSubtract);
        remainingFuelToSubtract -= fuelToSubtract;

        const { error: subtractError } = await supabase
          .from("inventory")
          .update({ quantity: quantity - fuelToSubtract })
          .eq("id", id);

        if (subtractError) {
          console.error("Error subtracting fuel from inventory:", subtractError.message);
          return;
        };
      };

      // Update the UI states
      setLaunchpad((prev) =>
        prev ? { ...prev, fuelCapacity: updatedFuelCapacity } : prev
      );
      setFuelAvailable((prev) => prev - fuelToAdd);
    } catch (err) {
      console.error("Unexpected error while adding fuel:", err);
    } finally {
      setIsAddingFuel(false);
    };
  };

  if (!launchpad) {
    return <p className="text-sm text-[#2C4F64]">No Launchpad Found</p>;
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow space-y-4">
      <div className="flex items-center space-x-2">
        <Rocket className="text-[#5FCBC3] w-6 h-6" />
        <h3 className="text-xl font-bold text-[#2C4F64]">Launchpad Information</h3>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#2C4F64]">Quantity: {launchpad.quantity}</p>
        <p className="text-sm font-medium text-[#2C4F64]">Fuel Capacity: {launchpad.fuelCapacity}</p>
        <p className="text-sm font-medium text-[#2C4F64]">Fuel Available: {fuelAvailable}</p>
      </div>
      <motion.div
        initial={{ scale: 1 }}
        animate={isAddingFuel ? { scale: 1.2 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={handleAddFuel}
          disabled={isAddingFuel || fuelAvailable <= 0}
          className="bg-[#5FCBC3] text-white hover:bg-[#5FCBC3]/80 w-full"
        >
          {isAddingFuel ? "Adding Fuel..." : "Add Fuel to Launchpad"}
        </Button>
      </motion.div>
    </div>
  );
};