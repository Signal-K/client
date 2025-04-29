import { useCallback, useEffect, useState } from "react";
import { StationCard } from "./StationCard";
import { Milestones } from "./Milestones";
import type { Station } from "@/types/station";
import type { Milestone } from "@/types/milestone";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryItem } from "@/types/Items";
import BiomassStats from "./BiomassOnPlanet";
import StationModal from "./StationModal"; 
import ClassificationStats from "../Milestones/ClassificationNumber";
import MilestoneCard from "../Milestones/MilestoneCard";

const initialStations: Station[] = [
  {
    id: "3104001",
    name: "Desert Observatory", 
    icon: "Sun",
    biome: {
      name: "Desert",
      color: "rgb(234, 255, 114)",
      accentColor: "rgb(234, 255, 100)",
      darkColor: "rgb(30, 58, 138)",
    },
    animals: [
      { name: "Burrowing Owl", icon: "Bird", biomassType: 'Fauna', mass: 0.5 },
      { name: "Iguanas (from above)", icon: "Turtle", biomassType: 'Fauna', mass: 0.25 },
    ],
    location: {
      coordinates: "23.4162° N, 75.2397° W",
      depth: "+2m",
    },
    built: false,
  },
  {
    id: "3104002",
    name: "Ocean Observatory",
    icon: "Waves",
    biome: {
      name: "Ocean",
      color: "rgb(22, 163, 255)",
      accentColor: "rgb(34, 87, 245)",
      darkColor: "rgb(20, 83, 45)",
    },
    animals: [
      { name: "Plankton Portal", icon: "Fish", biomassType: 'Fauna', mass: 0.0000001 },
    ],
    location: {
      coordinates: "2.4162° S, 54.2397° W",
      altitude: "-10m",
    },
    built: false,
  },
];

const initialMilestones: Milestone[] = [
  {
    id: "1",
    title: "Wildlife Observer",
    description: "Discover and document different animal species",
    current: 3,
    target: 10,
    type: "animals",
  },
  {
    id: "2",
    title: "Global Network",
    description: "Establish research stations worldwide",
    current: 1,
    target: 5,
    type: "stations",
  },
  {
    id: "3", 
    title: "Biome Explorer",
    description: "Research different environmental biomes",
    current: 1,
    target: 4,
    type: "biomes",
  },
];

export function GreenhouseResearchStations() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [stations, setStations] = useState<Station[]>(initialStations)
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [loading, setLoading] = useState<boolean | null>(false);
  const [activeStation, setActiveStation] = useState<Station | null>(null);
 
  const closeModal = () => setActiveStation(null);

  const fetchStations = useCallback(async () => {
    if (!session || !activePlanet) {
      setLoading(false);
      return;
    };

    setLoading(true);

    try {
      const { data: inventoryItems, error } = await supabase
        .from("inventory")
        .select("item, owner, quantity")
        .eq("owner", session.user.id)
        .eq("anomaly", activePlanet.id);

      if (error) {
        console.error("Error fetching inventory: ", error);
        throw error;
      }

      // Filter stations that are in the inventory and have quantity >= 1
      const ownedStations = inventoryItems
        .filter((item) => item.quantity >= 1)
        .map((item) => item.item);

      // Mark stations as built if they exist in the inventory and have quantity >= 1
      const updatedStations = stations.map((station) => ({
        ...station,
        built: ownedStations.includes(parseInt(station.id, 10)),
      }));

      setStations(updatedStations);

      // Update milestone for stations
      setMilestones((prevMilestones) =>
        prevMilestones.map((milestone) =>
          milestone.type === "stations"
            ? { ...milestone, current: ownedStations.length }
            : milestone
        )
      );
    } catch (error) {
      console.error("Error fetching stations: ", error);
    } finally {
      setLoading(false);
    }
  }, [session, supabase, activePlanet, stations]);

  useEffect(() => {
    if (!session) {
      return;
    }

    fetchStations();
  }, [session, fetchStations]);

  async function handleBuild(id: string) {
    setStations(stations.map((station) => (station.id === id ? { ...station, built: true } : station)));

    if (!session) {
      console.warn("Session error during station creation.");
      return;
    }

    try {
      const { error } = await supabase.from("inventory").insert([
        {
          owner: session.user.id,
          anomaly: activePlanet?.id || 30,
          item: id,
          quantity: 1,
          configuration: {},
        },
      ]);

      if (error) {
        throw error;
      }

      alert("You have built a new observatory for biological missions.");
    } catch (error) {
      console.error("Error adding greenhouse station: ", error);
    }

    // Update station milestone
    setMilestones((milestones) =>
      milestones.map((milestone) =>
        milestone.type === "stations" ? { ...milestone, current: milestone.current + 1 } : milestone
      )
    );
  }

  const buildableStations = stations.filter((station) => !station.built);
  const builtStations = stations.filter((station) => station.built);

  return (
<div className="min-h-screen bg-gray-900">
 {!activeStation &&  (   <div className="flex justify-center px-4 py-8">
  <div className="w-full max-w-5xl space-y-8">

        {/* Other content */}
          <div className="space-y-8">
            {/* Available Stations */}
            <section className=""> 
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Available Stations</h2>
              <div className="grid gap-6">
                {buildableStations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    onBuild={handleBuild}
                    onView={() => {}}
                  />
                ))}
              </div>
            </section>

            {/* Built Stations */}
            {builtStations.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Built Stations</h2>
                <div className="grid gap-6">
                  {builtStations.map((station) => (
                    <StationCard
                      key={station.id}
                      station={station}
                      onBuild={handleBuild}
                      onView={() => setActiveStation(station)}
                    />
                  ))}
                </div>
              </section>
            )}

            <div className="py-2"><BiomassStats /></div>
          </div>

          {/* <div className="lg:border-l lg:border-gray-800 lg:pl-8"> */}
            {/* <Milestones milestones={milestones} /> */}
            {/* <div className="py-2"><ClassificationStats /></div> */}
            
          {/* </div> */}
        </div>
      </div>
  )}
      {/* Render StationModal if there's an active station */}
      {activeStation && <StationModal station={activeStation} setActiveStation={setActiveStation} />}
    </div>
  );
};