import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { PlanetCard } from "./Content/Anomalies/PlanetData";

type Planet = {
  id: string;
  type: string;
  avatar_url: string;
  content: string;
};

type PickYourPlanetProps = {
  onPlanetSelect: (planetId: string) => void;
};

export default function PickYourPlanet({ onPlanetSelect }: PickYourPlanetProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();
  const [planetList, setPlanetList] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPlanets() {
    try {
      setLoading(true);
      const { data: planetsData, error: planetsError } = await supabase
        .from("anomalies")
        .select("*");

      if (planetsData) {
        setPlanetList(planetsData);
      }

      if (planetsError) {
        console.error("Error fetching planets: ", planetsError);
      }
    } catch (error: any) {
      console.log("Error fetching planets data: ", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePlanetSelect = async (planetId: string) => {
    try {
      // Update user's profile with the selected planet's ID
      await updatePlanetLocation(Number(planetId));

      // Create new entry in the missions table
      const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 1, // Assuming mission 1 for picking a planet
        configuration: null,
        rewarded_items: null
      };

      const { data: newMission, error: missionError } = await supabase
        .from("missions")
        .insert([missionData]);

      if (missionError) {
        throw missionError;
      }

      // Create new entry in the inventory table
      const inventoryData = {
        item: 29, // Assuming reward item ID for picking a planet is 29
        owner: session?.user?.id,
        quantity: 1,
        notes: "Created upon the completion of mission 1",
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: activePlanet?.id
      };

      const { data: newInventoryEntry, error: inventoryError } = await supabase
        .from("inventory")
        .insert([inventoryData]);

      if (inventoryError) {
        throw inventoryError;
      }

      // Callback to parent component if needed
      onPlanetSelect(planetId);
    } catch (error: any) {
      console.error("Error handling planet selection:", error.message);
    }
  };

  useEffect(() => {
    fetchPlanets();
  }, [session]);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">Step 1: Pick Your Planet</h1>
      <div className="container grid gap-6 md:gap-8 px-4 md:px-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {planetList.map((planet) => (
              <PlanetCard key={planet.id} planet={planet} onSelect={() => handlePlanetSelect(planet.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
