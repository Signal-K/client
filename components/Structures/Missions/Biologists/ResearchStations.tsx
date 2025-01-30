import { useCallback, useEffect, useState } from "react";
import { StationCard } from "./StationCard";
import { Milestones } from "./Milestones";
import type { Station } from "@/types/station";
import type { Milestone } from "@/types/milestone";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { InventoryItem } from "@/types/Items";
import BiomassStats from "./BiomassOnPlanet";

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
      { name: "Plankton Portal", icon: "Fish", biomassType: 'Fauna', mass: 0.0000001 }, // Need to update mass values
    ],
    location: {
      coordinates: "2.4162° S, 54.2397° W",
      altitude: "-10m",
    },
    built: false,
  },
  // {
  //   id: "3",
  //   name: "Arctic Research Base",
  //   icon: "Snowflake",
  //   biome: {
  //     name: "Polar",
  //     color: "rgb(148, 163, 184)",
  //     accentColor: "rgb(226, 232, 240)",
  //     darkColor: "rgb(51, 65, 85)",
  //   },
  //   animals: [
  //     { name: "Polar Bear", icon: "Bear" },
  //     { name: "Penguin", icon: "Bird" },
  //     { name: "Seal", icon: "Fish" },
  //   ],
  //   location: {
  //     coordinates: "78.4162° N, 15.2397° E",
  //   },
  //   built: false,
  // },
  // {
  //   id: "4",
  //   name: "Deep Sea Laboratory",
  //   icon: "Waves",
  //   biome: {
  //     name: "Abyssal",
  //     color: "rgb(30, 58, 138)",
  //     accentColor: "rgb(37, 99, 235)",
  //     darkColor: "rgb(30, 27, 75)",
  //   },
  //   animals: [
  //     { name: "Anglerfish", icon: "Fish" },
  //     { name: "Giant Squid", icon: "Bug" },
  //     { name: "Tube Worm", icon: "Wand2" },
  //   ],
  //   location: {
  //     coordinates: "31.4162° N, 159.2397° W",
  //     depth: "-2500m",
  //   },
  //   built: false,
  // },
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

  // const fetchStations = useCallback(async () => {
  //   if (!session || !activePlanet) {
  //     setLoading(false);
  //     return;
  //   };

  //   try {
  //     const { data: createdGreenhouseStations, error: createdGreenhouseStationsError } = await supabase
  //       .from("inventory")
  //       .select("*")
  //       .eq("owner", session.user.id)
  //       .eq("anomaly", activePlanet.id);

  //     if (createdGreenhouseStationsError) {
  //       console.error("Error");
  //       throw createdGreenhouseStationsError;
  //     };

  //     const ownedStations = createdGreenhouseStations.map((item: { item: number }) => item.item);
      
  //     const response = await fetch('/api/gameplay/inventory');
  //     const stationItems: InventoryItem[] = await response.json();
  //     const greenhouseStations = stationItems.filter(item =>
  //       item.ItemCategory === 'BioDomeStation'
  //     );

  //     setStations(greenhouseStations);
  //   } catch (error: any) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [session, supabase, activePlanet]);

  useEffect(() => {
    if (!session) {
      return;
    };

    // fetchStations();
  }, [session]);

  async function handleBuild (id: string) {
    setStations(stations.map((station) => (station.id === id ? { ...station, built: true } : station)))

    if (!session) {
      console.warn("A unique session error, relating to the attempted creation of a greenhouse station")
      return (null);
    };

    try {
      const { error } = await supabase
        .from("inventory")
        .insert([
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
      };

      alert("You have now built a new observatory for biological missions");
    } catch (error) {
      console.error("Error adding greenhouse station: ", error);
    };

    // Update station milestone
    setMilestones(
      milestones.map((milestone) =>
        milestone.type === "stations" ? { ...milestone, current: milestone.current + 1 } : milestone,
      ),
    );
  };

  const buildableStations = stations.filter((station) => !station.built)
  const builtStations = stations.filter((station) => station.built)

  return (
    <div className="min-h-screen bg-gray-900 bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(71,85,105,0.1)_40px,rgba(71,85,105,0.1)_80px)]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">Research Stations</h1>

        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Available Stations</h2>
              <div className="grid gap-6">
                {buildableStations.map((station) => (
                  <StationCard key={station.id} station={station} onBuild={handleBuild} />
                ))}
              </div>
            </section>

            {builtStations.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-blue-400">Built Stations</h2>
                <div className="grid gap-6">
                  {builtStations.map((station) => (
                    <StationCard key={station.id} station={station} onBuild={handleBuild} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:border-l lg:border-gray-800 lg:pl-8">
            <Milestones milestones={milestones} />
            {/* <BiomassStats /> */}
          </div>
        </div>
      </div>
    </div>
  );
};